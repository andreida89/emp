import React, { useState, useEffect } from 'react';
import rpc from 'utils/rpc';
import images from 'utils/images';

rpc.register(
    'NewsTicker-ShowItem',
    (message: string) => {
        NewsTicker(message);
    }
);

export default function NewsTicker(message: any) {
    const [text, setText] = useState('');
    const [isImagesSplit, setIsImagesSplit] = useState(false);
    const [isTickerVisible, setIsTickerVisible] = useState(false);
    const newText = message;

    useEffect(() => {
        // Define a global function to receive updates from the client-side script
        window.updateTickerWith = (newText) => {
            setText(newText);
            setIsImagesSplit(true);
            setIsTickerVisible(true);

            // Automatically hide the ticker after a certain period
            const hideTickerTimeout = setTimeout(() => {
                setIsImagesSplit(false);
                setIsTickerVisible(false);
            }, 20000); // Adjust timing as needed

            return () => {
                clearTimeout(hideTickerTimeout);
            };
        };
    }, []);

    return (
        <div className={`ticker-container ${isTickerVisible ? 'visible' : ''}`}>
            <div
                className={`ticker-image left-img ${isImagesSplit ? 'split' : ''}`}
                style={{ backgroundImage: `url(${images.getImage('1.webp')})` }}
            ></div>
            <div
                className={`ticker-image right-img ${isImagesSplit ? 'split' : ''}`}
                style={{ backgroundImage: `url(${images.getImage('2.webp')})` }}
            ></div>
            <div className={`ticker-text`}>
                <b>{text}</b>
            </div>
        </div>
    );
}
