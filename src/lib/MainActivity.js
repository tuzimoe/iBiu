import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Snackbar from 'material-ui/Snackbar';
import { CircularProgress } from 'material-ui/Progress';

import HomeIcon from 'material-ui-icons/Home';
import FavoriteIcon from 'material-ui-icons/Favorite';
import SupervisorAccountIcon from 'material-ui-icons/SupervisorAccount';

import { Stage } from './Stage';
import { Playlist } from './Playlist';
import { Dashboard } from './Dashboard';
import { Player } from './Player';
import { Login } from './Login';
import { picDB, Me, getMe, getCollects, MusicController, getHomeNew, getHomeHot } from './Util';

function TabContainer({ children, dir }) {
    return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
        {children}
    </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
    dir: PropTypes.string.isRequired,
};

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: "100%",
        height: "100%",
        display: "block",
    },
    bar: {
        position: "fixed",
        bottom: 0,
    },
    tab: {
        height: 65,
    },
    player: {
        position: "fixed",
        bottom: 90,
        right: 25,
    }
});

class FullWidthTabs extends Component {
    state = {
        value: 0,
        progress: 0,
        cover: "/icon.png",
        playState: 0
    };

    constructor(props) {
        super(props);
        this.coverReq = false;
    }

    logined = () => {
        getCollects((state, data) => {
            let collects = { my: [], others: []};
            data = data.result;
            for (let i in data) {
                let collectType = parseInt(data[i].type, 10)
                let collectUid = data[i].uid;

                if (collectType > 1) continue;
                if (collectUid === Me.uid) collects.my.push(data[i]);
                else collects.others.push(data[i]);
            }
            // this.setState({collects});
            collects.my.sort((a,b) => {return a.type < b.type});
            collects.others.sort((a,b) => {return a.type < b.type});
            this._playlist.setState({collects});
        });
        getHomeNew((state, data) => {
            let newSongs = [];
            for (let i = 0; i < 15; i++) {
                if (i in data) newSongs.push(data[i]);
            }
            this._stage.setState({newSongs});
        });
        getHomeHot((state, data) => {
            let hotSongs = [];
            for (let i = 0; i < 15; i++) {
                if (i in data) hotSongs.push(data[i]);
            }
            this._stage.setState({hotSongs});
        });
    }

    handleChange = (event, value) => {
        this.setState({ value });
        this._player.handleClose();
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    componentDidMount() {
        this.openLoginPanel();
        this.playerMonitor = setInterval(this.updateView.bind(this), 1000);
    }

    openLoginPanel() {
        if (!Me.token) {
            this._login.handleClickOpen();
        } else {
            let myName = Me.name;
            getMe((state, data) => {
                if (state) {
                    this.openSnack(`欢迎回来 ${Me.name} 喵~`);
                    this.logined();
                } else {
                    this.openSnack(`主人 ${myName} 的身份过期了喵~`);
                    this._login.handleClickOpen();
                }
            });
        }
    }

    componentWillUnmount() {
        if (this.playerMonitor) {
            clearInterval(this.playerMonitor);
            this.playerMonitor = null;
        }
    }

    updateView() {

        let p = MusicController.currentMusic.length;
        if (p > 0) {
            p = parseInt(100 * MusicController.player.currentTime / MusicController.currentMusic.length, 10);
        }
        this.setState({
            progress: p,
            cover: MusicController.currentMusic.sid ? 
                    `https://biu.moe/Song/showCover/sid/${MusicController.currentMusic.sid}` :
                    "/icon.png",
            playState: MusicController.state
        });

        if (MusicController.currentMusic.sid && document.getElementById("smallCover") && this.coverReq !== MusicController.currentMusic.sid) {
            this.coverReq = MusicController.currentMusic.sid;
            picDB.loadFile(null,
                parseInt(MusicController.currentMusic.sid, 10), 
                MusicController.currentMusic.title, 
                `https://biu.moe/Song/showCover/sid/${MusicController.currentMusic.sid}`, 
                "image/jpeg",
                MusicController.currentMusic, image => {
                    this.setState({cover: image})
                });
        }

    }

    openPlayer = () => {
        this._player.handleClickOpen();
    }

    openSnack = (msg) => {
        this.setState({ snackOpen: true, snackMsg: msg });
    };

    handleSnackClose = () => {
        this.setState({ snackOpen: false });
    };

    render() {
        const { classes, theme } = this.props;

        return (
            <div className={classes.root}>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={this.state.value}
                    onChangeIndex={this.handleChangeIndex}
                    style={{ height: "100%", marginBottom: 60 }}
                >
                    <TabContainer dir={theme.direction}><Stage player={this.openPlayer.bind(this)} ref={r => {this._stage = r}}/></TabContainer>
                    <TabContainer dir={theme.direction}><Playlist player={this.openPlayer.bind(this)} ref={r => {this._playlist = r}}/></TabContainer>
                    <TabContainer dir={theme.direction}><Dashboard loginPanel={this.openLoginPanel.bind(this)} snack={this.openSnack.bind(this)}/></TabContainer>
                </SwipeableViews>
                <Player ref={(r) => {this._player = r;}}/>
                <AppBar position="static" color="default" className={classes.bar}>
                    <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                    >
                        <Tab className={classes.tab} label="音乐广场" icon={<HomeIcon />} />
                        <Tab className={classes.tab} label="我的音乐" icon={<FavoriteIcon />} />
                        <Tab className={classes.tab} label="关于我"  icon={<SupervisorAccountIcon />} />
                    </Tabs>
                </AppBar>
                <Login ref={(r) => {this._login = r;}} snack={this.openSnack.bind(this)} logined={this.logined.bind(this)}/>
                <Button 
                    id="smallCover"
                    className={classes.player} 
                    onClick={() => {this._player.handleClickOpen();}}
                    variant="fab"
                    color="secondary"
                    aria-label="add"
                    style={{backgroundImage: `url(${this.state.cover})`,
                            backgroundSize: "cover",
                            width: 60,
                            height: 60}}>
                    <CircularProgress size={72} style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        zIndex: 1,
                        color: "rgb(73, 73, 255)"}} variant={this.state.playState === 2 ? "indeterminate" : "static"} value={this.state.progress} />
                </Button>
                
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={this.state.snackOpen}
                    onClose={this.handleSnackClose}
                    SnackbarContentProps={{
                        'aria-describedby': 'message',
                    }}
                    message={<span id="message">{this.state.snackMsg}</span>}
                    action={<Button color="secondary" size="small" onClick={this.handleSnackClose}>Dismiss</Button>}
                />
            </div>
        );
    }
}

FullWidthTabs.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(FullWidthTabs);