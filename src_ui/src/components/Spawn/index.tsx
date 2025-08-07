import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import rpc from 'utils/rpc';
import OutlineButton from 'components/Common/outline-button';
import images from 'utils/images';


type Props = {} & RouteComponentProps;
type State = {
    jail: boolean;
    exit: boolean;
};

export default class Spawn extends Component<Props, State> {
    readonly state: State = {
        jail: false,
        exit: true
    };

    componentDidMount() {
        this.setState(() => this.props.location.state);
    }

    selectSpawn() {
        rpc.callServer('Spawn-SelectType', ['exit']);
        rpc.callClient('Browser-HidePage');
    }

    render() {
        const { jail, exit } = this.state;

        return (
            <div className="spawn-overlay">
                <div className="spawn-dialog-container">
                    <div className="spawn-dialog-text">
                        <img src={images.getImage('logo3d.png')} alt="Empire logo" className="spawn-logo" />
                        <p>Nerespectarea regulamentului va duce la aplicarea sanctiunilor corespunzatoare, pe care le puteti gasi:</p>
<ul style={{ textAlign: "left", margin: "0 auto 1vw auto", maxWidth: 450 }}>
    <li>
        Pe serverul nostru de Discord:
        <span style={{ color: "#ff2c2c" }}> https://discord.gg/empirero</span>
    </li>
    <li>
        Pe pagina noastra web:
        <span style={{ color: "#ff2c2c" }}> https://empirerp.eu</span>
    </li>
</ul>

                    </div>
                    <button
                        className="login-btn"
                        onClick={this.selectSpawn.bind(this)}
                        disabled={jail && !exit}
                    >
                        INTRA PE SERVER
                    </button>
                </div>
            </div>
        );
    }
}
