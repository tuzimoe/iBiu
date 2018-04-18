import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import Collapse from 'material-ui/transitions/Collapse';
import { CircularProgress } from 'material-ui/Progress';
import List, { ListItem, ListItemIcon, ListItemText, } from 'material-ui/List';

import KeyboardArrowUpIcon from 'material-ui-icons/KeyboardArrowUp';

import {getOneCollect, MusicController, picDB } from './Util';

var showPlayer = null;

export class Song extends Component {

    state = {
        cover: "/icon.png"
    }

    onClickHandler() {
        MusicController.playList(this.props.list, this.props.i);
        showPlayer();
    }

    toTime = (t) => {
        let m = parseInt(t / 60, 10);
        t = t % 60;
        let res = "";
        if (m < 10) res = `0${m}:`; else res = `${m}:`;
        if (t < 10) res += `0${t}`; else res += `${t}`;
        return res;
    }

    componentWillMount() {
        let info = this.props.list[this.props.i];
        picDB.loadFile(null,
            parseInt(info.sid, 10), 
            info.title, 
            `https://biu.moe/Song/showCover/sid/${info.sid}`,
            "image/jpeg",
            info, image => {
                this.setState({cover: image})
            });
    }

    render() {
        let {album, length, sid, singer, title} = this.props.list[this.props.i];
        return (
        <ListItem button onClick={this.onClickHandler.bind(this)} style={{paddingLeft: "3em"}}>
            <Avatar>
                <img style={{width: "100%"}} src={this.state.cover} alt={sid}/>
            </Avatar>
            <ListItemText className="oneLine" primary={title} secondary={`${this.toTime(length)} | ${singer} - ${album}`}/>
        </ListItem>
    )}
}

export class SongList extends Component {

    state = {
        list: null
    }

    componentDidMount() {
        getOneCollect(this.props.info, (state, data) => {
            data = data.result;
            this.setState({list: data});
        });
    }

    render() {
        return (
            <div>
                {
                    this.state.list ?
                    this.state.list.map((song, i) => <Song key={song.sid} i={i} list={this.state.list} />) :
                    <ListItem button><CircularProgress size={30} color="secondary" style={{margin: "0 auto", opacity: .4}}/></ListItem>
                }
            </div>
        )
    }

}

export class CollectItem extends Component {

    state = {
        open: false,
        cover: "/icon.png"
    }

    componentWillMount() {
        let info = this.props.info;
        picDB.loadFile(null,
            -parseInt(info.lid, 10), 
            info.title, 
            `https://biu.moe/Collect/showCover/lid/${info.lid}`,
            "image/jpeg",
            info, image => {
                this.setState({cover: image})
            });
    }

    onClickHandler() {
        this.setState({open: !this.state.open});
    }

    render() {
        let { title, sids, lid } = this.props.info;
        return (
        <div style={{
            background: 'linear-gradient(to right, rgb(222, 247, 255) 0%, rgb(234, 223, 255) 100%)',
            boxShadow: "0 5px 25px rgba(0, 0, 0, 0.3)",
            borderRadius: 10,
            marginBottom: "1em",
        }}>
            <ListItem button onClick={this.onClickHandler.bind(this)}>
                <Avatar>
                    <img style={{width: "100%"}} src={this.state.cover} alt={lid}/>
                </Avatar>
                <ListItemText primary={title} secondary={`总计有 ${sids.length} 首喵~`}/>
            </ListItem>
            <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <SongList ref={r => {this._songlist = r;}} info={this.props.info}/>
                    <ListItem button onClick={this.onClickHandler.bind(this)}>
                        <ListItemIcon>
                            <KeyboardArrowUpIcon />
                        </ListItemIcon>
                        <ListItemText className="lessImportant" primary={`收起来啦 ~`}/>
                    </ListItem>
                </List>
            </Collapse>
        </div>
    )}
}

export class Playlist extends Component {
    
    state = {
        collects: {my: [], others: []},
    }

    render() { 
        showPlayer = this.props.player;
        return (
            <div className="pageContainer">
                <h1>PlayList</h1>
                <div className="settingList">
                    <List component="nav">
                        <h2 style={{marginLeft: "1em"}}>我</h2>
                        { this.state.collects.my.map(c => <CollectItem key={c.lid} info={c}/>)}
                        <br />
                        <h2 style={{marginLeft: "1em"}}>收藏</h2>
                        { this.state.collects.others.map(c => <CollectItem key={c.lid} info={c}/>)}
                    </List>
                </div>
                <div style={{marginBottom: "5em"}}></div>
            </div>
    )};
}