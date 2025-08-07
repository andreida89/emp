import React, { useState } from 'react';
import { IoIosSend } from 'react-icons/io';
import { inputRef } from '../index';

type Props = {
	onSubmit: (text: string) => void;
	navigateHistory: (direction: number) => string;
	onEmpty: () => void;
};

export default function ChatForm({ onSubmit, navigateHistory, onEmpty }: Props) {
	const [value, setValue] = useState('');

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			const cmd = navigateHistory(-1);
			setValue(cmd);
			setTimeout(() => {
				inputRef.current?.setSelectionRange(cmd.length, cmd.length);
			}, 0);
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const cmd = navigateHistory(1);
			setValue(cmd);
			setTimeout(() => {
				inputRef.current?.setSelectionRange(cmd.length, cmd.length);
			}, 0);
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			const val = value.trim();
			if (val.length) {
				onSubmit(val);
				setValue('');
			} else {
				onEmpty();
			}
		}
	};

	return (
		<div className="chat_form">
			<form
				onSubmit={e => {
					e.preventDefault();
					const val = value.trim();
					if (val.length) {
						onSubmit(val);
						setValue('');
					} else {
						onEmpty();
					}
				}}
			>
				<div className="chat_form-container">
					<input
						className="chat_form-input"
						type="text"
						ref={inputRef}
						value={value}
						autoComplete="off"
						onChange={e => setValue(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<button type="submit" className="chat_form-submit">
						<IoIosSend />
					</button>
				</div>
			</form>
		</div>
	);
}
