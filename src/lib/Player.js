import React, {Component} from 'react';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import Slide from 'material-ui/transitions/Slide';
import { LinearProgress } from 'material-ui/Progress';

import CloseIcon from 'material-ui-icons/Close';
import PlayArrowIcon from 'material-ui-icons/PlayArrow';
import PauseIcon from 'material-ui-icons/Pause';
import SkipPreviousIcon from 'material-ui-icons/SkipPrevious';
import SkipNextIcon from 'material-ui-icons/SkipNext';

import { MusicController } from './Util';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

export class Player extends Component {
    state = {
        open: false,
        completed: 0,
        total: 0,
        playing: 0,
        title: "还没有音乐呐",
        cover: "/icon.png",
        playState: 0
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    toTime = (t) => {
        let m = parseInt(t / 60, 10);
        t = t % 60;
        let res = "";
        if (m < 10) res = `0${m}:`; else res = `${m}:`;
        if (t < 10) res += `0${t}`; else res += `${t}`;
        return res;
    }

    play() {
        if (MusicController.player.paused) {
            MusicController.play();
        } else { 
            MusicController.pause();
        }
    }

    prev() { MusicController.playControl(-1); }

    next() { MusicController.playControl( 1); }

    updateView() {
        this.setState({
            title: MusicController.currentMusic.title,
            cover: MusicController.currentMusic.sid ? 
                    `https://biu.moe/Song/showCover/sid/${MusicController.currentMusic.sid}` :
                    "/icon.png",
            playing: MusicController.player.paused ? 0 : 1,
            completed: parseInt(MusicController.player.currentTime, 10),
            total: MusicController.currentMusic.length,
            playState: MusicController.state
        });
    }

    componentDidMount() {
        this.playerMonitor = setInterval(this.updateView.bind(this), 300);
    }

    componentWillUnmount() {
        if (this.playerMonitor) {
            clearInterval(this.playerMonitor);
            this.playerMonitor = null;
        }
    }

    render() {
        return (
        <div>
            <Dialog
            fullScreen
            open={this.state.open}
            onClose={this.handleClose}
            transition={Transition}
            style={{zIndex: 900}}
            className="player"
            >
                <h1 style={{overflowX: "hidden"}}>{this.state.title}</h1>
                <img className="playerCover" src={this.state.cover} alt="cover"/>
                <LinearProgress style={{width: "90%", margin: "2em auto", marginBottom: ".2em"}} color="secondary" variant={this.state.playState === 2 ? "indeterminate" : "determinate"} value={Math.round(100 * this.state.completed / this.state.total)} />
                <div style={{width: "90%", margin: ".8em auto", color: "#888"}}>
                    <span>{this.toTime(this.state.completed)}</span>
                    <span style={{float: "right"}}>{this.toTime(this.state.total)}</span>
                </div>
                <div style={{position: "fixed",
                            bottom: 90,
                            left: 25,
                            background: "#2041ff",
                            width: 255,
                            borderRadius: 60,
                            boxShadow: "0 5px 25px rgba(0, 0, 0, 0.4)",
                            height: 60}}>
                    <IconButton onClick={this.prev.bind(this)} aria-label="SkipPrevious" style={{color: "white",width: 60,height: 60, marginLeft: 15}}>
                        <SkipPreviousIcon />
                    </IconButton>
                    <IconButton onClick={this.play.bind(this)} aria-label="Play" style={{color: "white",width: 60,height: 60, marginLeft: 15}}>
                        {this.state.playing === 1 ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton onClick={this.next.bind(this)} aria-label="SkipNext" style={{color: "white",width: 60,height: 60, marginLeft: 15}}>
                        <SkipNextIcon />
                    </IconButton>
                </div>
                <Button 
                    onClick={this.handleClose}
                    variant="fab"
                    color="primary"
                    aria-label="Close"
                    style={{position: "fixed",
                            bottom: 90,
                            right: 25,
                            background: "#2041ff",
                            width: 60,
                            boxShadow: "0 5px 25px rgba(0, 0, 0, 0.4)",
                            height: 60}}>
                    <CloseIcon />
                </Button>
            </Dialog>
        </div>
        );
    }
}