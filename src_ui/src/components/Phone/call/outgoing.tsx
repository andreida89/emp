import React from 'react';
import {
	IoIosMicOff,
	IoIosKeypad,
	IoIosAdd,
	IoIosPeople,
	IoIosCall
} from 'react-icons/io';
import Info from './info';
import Controls from './controls';

type Props = {
	name: string;
	callTime?: string;
	isRecieveCall: boolean;
	onControlClick: (control: string) => void;
};

const controls = [
    {
        name: 'mic',
        label: 'Dezact. sunet',
        icon: IoIosMicOff
    },
    {
        name: 'keypad',
        label: 'Tastatura',
        icon: IoIosKeypad
    },
    {
        name: 'add',
        label: 'Adauga',
        icon: IoIosAdd
    },
    {
        name: 'contacts',
        label: 'Contacte',
        icon: IoIosPeople
    },
    {
        name: 'decline',
        label: 'Respinge',
        icon: IoIosCall
    }
];


export default function OutgoingCall({ name, isRecieveCall, onControlClick }: Props) {
	return (
		<div className="call_outgoing">
			<Info
				name={name}
				status={isRecieveCall ? 'In desfasurare' : 'Apel pe mobil..'}
			/>

			<Controls items={controls} onClick={onControlClick} />
		</div>
	);
}
