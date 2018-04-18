import React, { Component } from 'react';
import Button from 'material-ui/Button';
import { Me, Settings } from './Util';

import List, { ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, } from 'material-ui/List';
import Switch from 'material-ui/Switch';

import CloudDownloadIcon from 'material-ui-icons/CloudDownload';
import FileDownloadIcon from 'material-ui-icons/FileDownload';
import DeleteIcon from 'material-ui-icons/Delete';

import RepeatOneIcon from 'material-ui-icons/RepeatOne';
import ShuffleIcon from 'material-ui-icons/Shuffle';
import TimerIcon from 'material-ui-icons/Timer';

import InfoIcon from 'material-ui-icons/Info';

class UserCard extends Component {

    state = {
        checked: ['cache'],
    };

    constructor(props) {
        super(props);
        this.state = {
            checked: Object.entries(Settings).filter(s => s[1]).map(s => s[0])
        }
    }

    handleToggle = value => () => {
        const { checked } = this.state;
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
    
        if (currentIndex === -1) {
            newChecked.push(value);
            Settings[value] = 1;
        } else {
            newChecked.splice(currentIndex, 1);
            Settings[value] = 0;
        }
    
        this.setState({
            checked: newChecked,
        });
        
    };

    about() {
        this.props.snack("作者: 響喵，有什么问题可以直接来 Biu 群找我哦~");
    }

    render() {return (
        <div className="pageContainer">
            <div style={{
                width: "80%",
                margin: "2em auto",
                background: 'linear-gradient(to right, rgb(73, 73, 255) 0%, rgb(187, 152, 255) 100%)',
                boxShadow: "0 5px 25px rgba(0, 0, 0, 0.3)",
                borderRadius: 10,
                padding: "20px 30px",
                display: "flex",
                }}>
                <img src={`https://biu.moe/User/showAvatar/uid/${Me.uid}`} alt={Me.name}
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: "100%",
                        display: "inline-block"
                    }}></img>
                <div style={{display: "inline-block", marginLeft: "1em", paddingTop: 10}}>
                    <h2 style={{color: "white", marginTop: 0, marginBottom: 0}}>{Me.name}</h2>
                    <h5 style={{color: "#AAA", margin: "0 0", marginLeft: ".5em"}}>ID: {Me.uid}</h5>
                </div>
                <span style={{flex: 1}}></span>
                <Button style={{color: "#ff4276", lineHeight: "45px", fontWeight: 900}} size="small" onClick={this.handleSnackClose}>Logout</Button>
            </div>

            <div className="settingList">
                <List component="nav">
                    <h2 style={{marginLeft: "1em"}}>播放设置</h2>
                    <ListItem>
                        <ListItemIcon>
                            <RepeatOneIcon />
                        </ListItemIcon>
                        <ListItemText primary="单曲循环" />
                        <ListItemSecondaryAction>
                        <Switch
                            onChange={this.handleToggle('repeat')}
                            checked={this.state.checked.indexOf('repeat') !== -1}
                        />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ShuffleIcon />
                        </ListItemIcon>
                        <ListItemText primary="随机播放" />
                        <ListItemSecondaryAction>
                        <Switch
                            onChange={this.handleToggle('shuffle')}
                            checked={this.state.checked.indexOf('shuffle') !== -1}
                        />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <TimerIcon />
                        </ListItemIcon>
                        <ListItemText primary="定时关闭"/>
                    </ListItem>
                </List>
                <List component="nav">
                    <h2 style={{marginLeft: "1em"}}>下载设置</h2>
                    <ListItem>
                        <ListItemIcon>
                            <FileDownloadIcon />
                        </ListItemIcon>
                        <ListItemText primary="开启缓存" />
                        <ListItemSecondaryAction>
                        <Switch
                            onChange={this.handleToggle('cache')}
                            checked={this.state.checked.indexOf('cache') !== -1}
                        />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon>
                            <CloudDownloadIcon />
                        </ListItemIcon>
                        <ListItemText primary="查看缓存" />
                    </ListItem>
                    <ListItem button>
                        <ListItemIcon className="important">
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText primary="清空缓存" className="important"/>
                    </ListItem>
                </List>
                <List component="nav">
                    <h2 style={{marginLeft: "1em"}}>关于</h2>
                    <ListItem button onClick={this.about.bind(this)}>
                        <ListItemIcon>
                            <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="关于软件"/>
                    </ListItem>
                </List>
            </div>
        </div>
    )}

}

export class Dashboard extends Component {
    
    render() { 
        return (
            <div>
                <h1>Dashboard</h1>
                <UserCard snack={this.props.snack}></UserCard>
                <div style={{
                    color: "#AAA",
                    fontSize: ".8em",
                    textAlign: "center",
                    fontFamily: "sans-serif",
                    marginTop: "2em"
                }}>Build v0.3.1b.<br />Copyright Biu & YuunoHibiki 2018.</div>
                <div style={{marginBottom: "5em"}}></div>
            </div>
    )};
}