import React, { Component } from 'react';
import Card, { CardMedia } from 'material-ui/Card';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';

import { picDB, MusicController } from './Util';

var showPlayer = null;

class SingleGrid extends Component {

    state = {
        cover: "/icon.png"
    }

    constructor(props) {
        super(props);
        this.currentPic = null;
    }

    loadPic(sid, title, info) {
        this.currentPic = sid;
        picDB.loadFile(null,
            parseInt(sid, 10), 
            title, 
            `https://biu.moe/Song/showCover/sid/${sid}`,
            "image/jpeg",
            info, image => {
                this.setState({cover: image})
            });
    }

    render() {

        let info = this.props.info;
        if (info === null) {
            info = { title: "Loading..." }
        } else {
            if (this.currentPic !== info.sid) 
                this.loadPic(info.sid, info.title, info);
        }
        
        return (
            <GridListTile key={this.props.key} style={{ width: "100%", height: 120, padding: 0, marginRight: 5, borderRadius: 10, overflow: "hidden", }}>
                <img src={this.state.cover} alt={info.title} />
                <GridListTileBar
                    title={info.title}
                    classes={{ root: "titleBar", title: "titleTitle" }}
                />
            </GridListTile>
        );
    }
}



class MyGridList extends Component {

    updateView() {
        this.currentPage ++;
        this.currentPage %= 3;
        let content = window.document.querySelector(".gridList ul").children;
        content[0].style.marginLeft=`calc(-${this.currentPage * 4}px - ${this.currentPage * 100}%)`;
        if (this.currentPage === 2) {
            content[1].style.marginLeft=`calc(-4px - 100%)`;
        } else {
            content[1].style.marginLeft=`-4px`;
        }
    }

    componentDidMount() {
        this.currentPage = 0;
        this.gridChangeInterval = setInterval(this.updateView.bind(this), 5000);
    }

    componentWillUnmount() {
        if (this.gridChangeInterval) {
            clearInterval(this.gridChangeInterval);
            this.gridChangeInterval = null;
        }
    }

    onClickHandler() {
        MusicController.append(this.props.info[this.currentPage]);
        showPlayer();
    }

    render() { return (
      <div className="gridList clickable" onClick={this.onClickHandler.bind(this)}>
        <GridList className="innerGridList" cols={2}>
            <SingleGrid key={1} info={this.props.info[0] || null} />
            <SingleGrid key={2} info={this.props.info[1] || null} />
            <SingleGrid key={3} info={this.props.info[2] || null} />
        </GridList>
      </div>
    )}

}

class Cover extends Component {
    
    state = {
        cover: "/icon.png"
    }

    componentWillMount() {
        picDB.loadFile(null,
            parseInt(this.props.info.sid, 10), 
            this.props.info.title, 
            `https://biu.moe/Song/showCover/sid/${this.props.info.sid}`,
            "image/jpeg",
            this.props.info, image => {
                this.setState({cover: image})
            });
    }

    onClickHandler() {
        MusicController.append(this.props.info);
        showPlayer();
    }

    render() { return (
        <Card style={{
            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
            width: this.props.size,
            height: this.props.size,
            display: "inline-block",
            margin: "8px 8px"
        }} className="clickable" onClick={this.onClickHandler.bind(this)}>
            <CardMedia
                style={{
                    width: this.props.size,
                    height: this.props.size,
                    borderRadius: 5
                }}
                image={this.state.cover}
                title={this.props.info.title}
            />
        </Card>
    );}
}

export class Stage extends Component {

    state = {
        newSongs: [],
        hotSongs: []
    }
    
    render() { 
        showPlayer = this.props.player;
        return (
            <div className="pageContainer">
                <div className="divList">
                    <h1>Music Center</h1>
                    <MyGridList info={ this.state.hotSongs }/>
                    <h2>最热歌曲</h2>
                    <div className="coverWrapper">
                        { this.state.hotSongs.map(s => <Cover key={s.sid} size={90} info={s}/>) }
                    </div>
                    <h2>最新歌曲</h2>
                    <div className="coverWrapper">
                        { this.state.newSongs.map(s => <Cover key={s.sid} size={90} info={s}/>) }
                    </div>
                </div>
                <div style={{marginBottom: "5em"}}></div>
            </div>
    )};
}