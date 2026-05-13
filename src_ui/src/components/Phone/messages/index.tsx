import React, { Component, Fragment } from 'react';
import rpc from 'utils/rpc';
import { IoIosSend, IoIosArrowBack, IoIosPerson, IoIosAdd, IoIosPin } from 'react-icons/io';
import Navigation from '../partials/navigation';

type MessageData = {
	phone: string;
	text: string;
	type: 'incoming' | 'outgoing';
	date: number;
	read: boolean;
};

type ContactData = {
	phone: string;
	firstName: string;
	lastName: string;
};

type State = {
	messages: MessageData[];
	contacts: ContactData[];
	activeChat?: string;
	messageInput: string;
	recipientNumber: string;
};

export default class Messages extends Component<{}, State> {
	readonly state: State = {
		messages: [],
		contacts: [],
		messageInput: '',
		recipientNumber: ''
	};
    
	messagesEnd: HTMLDivElement | null = null;
    
	componentDidMount() {
		this.fetchData();
        (window as any).refreshPhoneMessages = () => this.fetchData();
	}

	async fetchData() {
		let activeChat = this.state.activeChat;
		if ((window as any).targetMessagePhone) {
			activeChat = (window as any).targetMessagePhone;
			delete (window as any).targetMessagePhone;
		}
		
		if (activeChat && activeChat !== this.state.activeChat) {
			this.setState({ activeChat });
		}

		try {
			const [messages, contactsData] = await Promise.all([
				rpc.callServer('Phone-GetMessages'),
				rpc.callServer('Phone-GetContactsData')
			]);

			this.setState({ 
				messages: (messages || []).map((m: any) => ({
					...m,
					read: typeof m.read === 'boolean' ? m.read : true
				})), 
				contacts: contactsData ? contactsData.contacts : [],
				activeChat
			}, () => {
				if (activeChat && activeChat !== 'new') {
					this.scrollToBottom();
					this.markAsRead(activeChat);
				}
			});
		} catch (err) {
			console.error("Failed to fetch phone data:", err);
		}
	}

	async markAsRead(phone: string) {
		try {
			await rpc.callServer('Phone-MarkAsRead', phone);
			// Local update
			this.setState(state => ({
				messages: state.messages.map(m => 
					(m.phone === phone && m.type === 'incoming') ? { ...m, read: true } : m
				)
			}));
		} catch (err) {}
	}

	getContactName(phone: string) {
		const contact = this.state.contacts.find(c => c.phone === phone);
		return contact ? `${contact.firstName} ${contact.lastName}` : phone;
	}

	getChats() {
		const chats = new Map<string, { lastMsg: MessageData; unreadCount: number }>();
		this.state.messages.forEach(msg => {
			const data = chats.get(msg.phone) || { lastMsg: msg, unreadCount: 0 };
			if (msg.date >= data.lastMsg.date) {
				data.lastMsg = msg;
			}
			if (msg.type === 'incoming' && !msg.read) {
				data.unreadCount++;
			}
			chats.set(msg.phone, data);
		});
		return Array.from(chats.values()).sort((a, b) => b.lastMsg.date - a.lastMsg.date);
	}

	async sendLocation() {
		const { activeChat, recipientNumber } = this.state;
		const target = activeChat === 'new' ? recipientNumber : activeChat;
		if (!target) return;

		try {
			const newMsg = await rpc.callServer('Phone-SendLocation', target);
			if (newMsg && !newMsg.err) {
				this.setState(state => ({
					messages: [...state.messages, { ...newMsg, read: true }],
					activeChat: target
				}), () => {
					this.scrollToBottom();
					this.fetchData();
				});
			}
		} catch (err: any) {
			console.log(err);
		}
	}

	async handleMessageClick(msg: MessageData) {
		if (msg.text.includes('[Locatie GPS]')) {
			try {
				const coordsStr = msg.text.split('[Locatie GPS]')[1].trim();
				if (coordsStr) {
					await rpc.callClient('Phone-SetWaypoint', coordsStr);
				}
			} catch (err) {}
		}
	}

	async sendMessage(e: React.FormEvent) {
		e.preventDefault();
		const { messageInput, activeChat, recipientNumber } = this.state;
		
		const target = activeChat === 'new' ? recipientNumber : activeChat;
		if (!target || !messageInput.trim()) return;

		try {
			const newMsg = await rpc.callServer('Phone-SendMessage', { 
				num: target, 
				text: messageInput.trim() 
			});
			if (newMsg && !newMsg.err) {
				this.setState(state => ({
					messages: [...state.messages, { ...newMsg, read: true }],
					messageInput: '',
					activeChat: target
				}), () => {
					this.scrollToBottom();
					// Force refresh list data properly
					this.fetchData();
				});
			} else if (newMsg && newMsg.err) {
				// Show error notification if possible
				rpc.callClient('HUD-NotifyComponent', [newMsg.err.msg || 'Eroare la trimitere', 'error']);
			}
		} catch (err: any) {
			console.log(err);
		}
	}
    
	scrollToBottom = () => {
		if (this.messagesEnd) {
			this.messagesEnd.scrollIntoView({ behavior: "smooth" });
		}
	}

	renderChatList() {
		const chats = this.getChats();
		return (
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Mesaje</h3>
                    <IoIosAdd size={28} color="#007aff" style={{ cursor: 'pointer' }} onClick={() => this.setState({ activeChat: 'new', recipientNumber: '' })} />
                </div>
				<div className="contacts_list" style={{ flex: 1, overflowY: 'auto' }}>
					{chats.map(({ lastMsg, unreadCount }) => (
						<div key={lastMsg.phone} 
                            onClick={() => {
                                this.setState({ activeChat: lastMsg.phone }, () => {
									this.scrollToBottom();
									if (unreadCount > 0) this.markAsRead(lastMsg.phone);
								});
                            }}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '10px 15px', 
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
							<div style={{ position: 'relative', minWidth: '40px', height: '40px', background: '#f2f2f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                <IoIosPerson size={22} color="#8e8e93" />
                                {unreadCount > 0 && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', pointerEvents: 'none' }}>
                                        <div style={{ width: '10px', height: '10px', background: '#007aff', borderRadius: '50%', border: '2px solid #fff' }}></div>
                                    </div>
                                )}
                            </div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
									<span style={{ fontSize: '15px', fontWeight: unreadCount > 0 ? 700 : 500, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {this.getContactName(lastMsg.phone)}
                                    </span>
									<span style={{ fontSize: '11px', color: unreadCount > 0 ? '#007aff' : '#8e8e93', fontWeight: unreadCount > 0 ? 600 : 400 }}>
                                        {new Date(lastMsg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
								</div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {lastMsg.phone !== this.getContactName(lastMsg.phone) && (
                                        <span style={{ fontSize: '11px', color: '#8e8e93', whiteSpace: 'nowrap' }}>{lastMsg.phone} ·</span>
                                    )}
                                    <span style={{ fontSize: '13px', color: unreadCount > 0 ? '#333' : '#8e8e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                        {lastMsg.text.includes('[Locatie GPS]') ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><IoIosPin size={12}/> Locatie GPS</span>
                                        ) : lastMsg.text}
                                    </span>
                                </div>
							</div>
						</div>
					))}
					{chats.length === 0 && (
						<div style={{ textAlign: 'center', opacity: 0.5, marginTop: '30px', fontSize: '14px' }}>Nu există conversații.</div>
					)}
				</div>
				<Navigation />
			</div>
		);
	}

	renderActiveChat() {
		const { activeChat, messages, messageInput, recipientNumber } = this.state;
		const isNew = activeChat === 'new';
		const targetPhone = isNew ? recipientNumber : activeChat!;
		
		const chatMessages = messages.filter(m => m.phone === targetPhone).sort((a,b) => a.date - b.date);

		return (
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
				<div style={{ background: '#f5f5f5', padding: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', zIndex: 10 }}>
					<IoIosArrowBack size={24} onClick={() => this.setState({ activeChat: undefined, recipientNumber: '' })} style={{ cursor: 'pointer', marginRight: '10px' }} />
					{isNew ? (
						<div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
							<input 
								type="text" 
								placeholder="Către: Număr de telefon..." 
								value={recipientNumber} 
								onChange={e => this.setState({ recipientNumber: e.target.value })}
								style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '14px', minWidth: 0 }}
							/>
							<div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '50%', marginLeft: '10px' }}>
								<IoIosPerson size={20} color="#007aff" style={{ pointerEvents: 'none' }} />
								<select 
									onChange={e => { if(e.target.value) this.setState({ recipientNumber: e.target.value }) }}
									style={{ position: 'absolute', top: 0, left: 0, opacity: 0.01, width: '100%', height: '100%', cursor: 'pointer' }}
								>
									<option value="">Alege...</option>
									{(this.state.contacts || []).map(c => (
										<option key={c.phone} value={c.phone}>{c.firstName} {c.lastName} ({c.phone})</option>
									))}
								</select>
							</div>
						</div>
					) : (
						<span style={{ fontSize: '16px', fontWeight: 600 }}>{this.getContactName(targetPhone)}</span>
					)}
				</div>
                
				<div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
					{chatMessages.map((msg, i) => (
						<div key={i} onClick={() => this.handleMessageClick(msg)} style={{ 
							maxWidth: '80%', 
							alignSelf: msg.type === 'outgoing' ? 'flex-end' : 'flex-start',
							background: msg.type === 'outgoing' ? '#007aff' : '#e5e5ea',
							color: msg.type === 'outgoing' ? '#fff' : '#000',
							padding: '10px 15px',
							borderRadius: msg.type === 'outgoing' ? '15px 15px 0 15px' : '15px 15px 15px 0',
							wordBreak: 'break-word',
                            fontSize: '14px',
                            cursor: msg.text.includes('[Locatie GPS]') ? 'pointer' : 'default'
						}}>
							{msg.text.includes('[Locatie GPS]') ? '📍 Locatie GPS' : msg.text}
						</div>
					))}
					<div ref={(el) => { this.messagesEnd = el; }} />
				</div>
                
				<form onSubmit={this.sendMessage.bind(this)} style={{ padding: '8px 10px', display: 'flex', borderTop: '1px solid #eee', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                    <button type="button" onClick={this.sendLocation.bind(this)} style={{ background: 'transparent', border: 'none', color: '#007aff', marginRight: '8px', fontSize: '20px', display: 'flex', padding: 0 }}>
					    <IoIosPin />
					</button>
					<input 
						type="text" 
						value={messageInput}
						onChange={e => this.setState({ messageInput: e.target.value })}
						placeholder="Mesaj..."
						style={{ flex: 1, minWidth: 0, border: '1px solid #ddd', borderRadius: '20px', padding: '8px 12px', outline: 'none', fontSize: '13px' }}
					/>
					<button type="submit" style={{ background: 'transparent', border: 'none', color: '#007aff', marginLeft: '8px', fontSize: '24px', display: 'flex', alignItems: 'center', padding: 0 }}>
						<IoIosSend />
					</button>
				</form>
			</div>
		);
	}

	render() {
		return (
			<div className="phone_contacts" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
				{this.state.activeChat ? this.renderActiveChat() : this.renderChatList()}
			</div>
		);
	}
}
