import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Card, { CardMedia } from 'material-ui/Card';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';

const styles = theme => ({
    root: {
        marginBottom: "3em",
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        borderRadius: 10,
        boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.2)",
    },
    gridList: {
        flexWrap: 'nowrap',
        transform: 'translateZ(0)',
        height: 120,
        borderRadius: 10,
        background: "rgba(255, 255, 255, 0)"
    },
    title: {
        color: "white",
    },
    titleBar: {
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)',
    },
});

class SingleGrid extends Component {
    render() {
        let { img, title, key, classes } = this.props;
        return (
            <GridListTile key={key} style={{ width: "100%", height: 120, padding: 0, marginRight: 5, borderRadius: 10, overflow: "hidden", }}>
                <img src={img} alt={title} />
                <GridListTileBar
                    title={title}
                    classes={{ root: classes.titleBar, title: classes.title }}
                />
            </GridListTile>
        );
    }
}

function SingleLineGridList(props) {
    const { classes } = props;
  
    return (
      <div className={classes.root}>
        <GridList className={classes.gridList} cols={2}>
            <SingleGrid classes={classes} key={1} img="https://biu.moe/Public/Lcover/0/1810.jpeg" title="点兔萌萌哒" />
            <SingleGrid classes={classes} key={2} img="https://biu.moe/Public/Lcover/0/1810.jpeg" title="点兔萌萌哒" />
            <SingleGrid classes={classes} key={3} img="https://biu.moe/Public/Lcover/0/1810.jpeg" title="点兔萌萌哒" />
        </GridList>
      </div>
    );
  }
  
SingleLineGridList.propTypes = {
    classes: PropTypes.object.isRequired,
};
  
export var MyGridList = withStyles(styles)(SingleLineGridList);

class Cover extends Component {
    render() { return (
        <Card style={{
            boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.2)",
            width: this.props.size,
            height: this.props.size,
            display: "inline-block",
            margin: "8px 8px"
        }} className="clickable">
            <CardMedia
                style={{
                    width: this.props.size,
                    height: this.props.size,
                    borderRadius: 5
                }}
                image="https://biu.moe/Public/Lcover/5/2915.jpeg"
                title="Live from space album cover"
            />
        </Card>
    );}
}

export class Stage extends Component {
    
    render() { 
        return (
            <div className="pageContainer">
                <div className="divList">
                    <h1>Music Center</h1>
                    <MyGridList />
                    <h2>最新歌曲</h2>
                    <div className="coverWrapper">
                        <Cover size={90} /> <Cover size={90} /> <Cover size={90} />
                        <Cover size={90} /> <Cover size={90} /> <Cover size={90} />
                        <Cover size={90} /> <Cover size={90} /> <Cover size={90} />
                    </div>
                    <h2>最热歌曲</h2>
                    <div className="coverWrapper">
                        <Cover size={90} /> <Cover size={90} /> <Cover size={90} />
                        <Cover size={90} /> <Cover size={90} /> <Cover size={90} />
                        <Cover size={90} /> <Cover size={90} /> <Cover size={90} />
                    </div>
                </div>
                <div style={{marginBottom: "5em"}}></div>
            </div>
    )};
}