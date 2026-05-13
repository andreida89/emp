import React from 'react';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';
import { ToastContainer, Zoom, Flip } from 'react-toastify';

import moment from 'moment-timezone';
import Routes from 'routes';
import store from 'store';
import rpc from 'utils/rpc';
import Chat from 'components/Chat';
import AdminMenu from 'components/AdminMenu';
import AdminTicketSystem from 'components/Admin/tickets';
import Notificari from 'components/HUD/notificari';
import Notifi from 'components/HUD/notifi';
import 'moment/locale/ru';

import 'assets/styles/framework7/index.less';
import 'react-toastify/dist/ReactToastify.css';
import 'rc-slider/assets/index.css';
import 'assets/styles/index.scss';

moment.locale( 'ro' );
moment.tz.setDefault( 'Europe/Bucharest' );

const history = createHashHistory();

rpc.register( 'Browser-ShowPage', ( page: string, data = {} ) => {
	const path = `/${ page }`;

	if ( history.location.pathname === path ) history.push( '/', {} );
	history.push( path, data );
} );

rpc.register( 'Browser-UpdateState', ( data: { type: string; payload?: any } ) => {
	store.dispatch( data );
} );

//@ts-ignore
window.CaptureMugshotBase64 = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();
    
    image.onload = function() {
        const width = Math.floor(image.width / 10);
        const height = Math.floor(image.height / 6.2);
        canvas.width = width;
        canvas.height = height;
        
        context?.drawImage(image, 0, 0, width, height, 0, 0, width, height);
        
        const base64 = canvas.toDataURL("image/jpeg", 0.9);
        if ((window as any).mp) {
            (window as any).mp.trigger('client:uploadMugshotBase64', base64);
        }
    };
    
    image.onerror = function() {
        if ((window as any).mp) {
            (window as any).mp.trigger('client:uploadMugshotBase64', "");
        }
    };

    image.crossOrigin = "Anonymous";
    image.src = "http://screenshots/player_headshot.jpg?t=" + Date.now();
};

export default function App() {

	//@ts-ignore
	window.showInterface = (route: string) => {
		const path = `/${route}`;

		if (history.location.pathname === path) history.push('/', {});
		history.push(path, {});
	}


	return (
		<Provider store={store}>
			<Routes history={history} />

			<Chat />
			<AdminMenu />
			<AdminTicketSystem />
			<Notificari />
			<Notifi />

			<ToastContainer
				enableMultiContainer
				containerId="hud"
				className="notifications"
				toastClassName="notifications_item"
				bodyClassName="notifications_body"
				position="top-center"
				transition={Zoom}
				autoClose={2300}
				closeButton={false}
				draggable={false}
				limit={1}
				newestOnTop
				hideProgressBar
			/>
			<ToastContainer
				enableMultiContainer
				containerId="menu"
				className="menu-notifications"
				toastClassName="menu-notifications-item"
				bodyClassName="menu-notifications-body"
				position="bottom-center"
				transition={Flip}
				autoClose={2300}
				closeButton={false}
				draggable={false}
				limit={1}
				newestOnTop
				hideProgressBar
			/>
		</Provider>
	);
}