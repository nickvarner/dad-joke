import React, { Component } from 'react'
import axios from 'axios';
import "./JokeList.css";
import Joke from './Joke';

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 5
    }
    constructor(props) {
        super(props);
        this.state = { 
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]" ),
            loading: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.seenJokes = new Set(this.state.jokes.map(j => j.id));
    }
    async getJokes(){
        try {
            let jokes = [];
            while(jokes.length < this.props.numJokesToGet){
                let res = await axios.get("https://icanhazdadjoke.com", {
                    headers: { Accept: "application/json" }
                });
                let joke = res.data;
                let isUnique = this.seenJokes.has(joke.id)
                if(!isUnique) {
                    jokes.push({ id: joke.id, text: joke.joke, votes: 0});
                    this.seenJokes.add(joke.id);
                } else {
                    console.log("encountered duplicate")
                    console.log(`did not add ${joke.joke}`);
                }           
            }
            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }),
            () => 
                window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
            );
        } catch (e) {
            alert(e);
            this.setState({ loading: false })
        }
    }
    async componentDidMount(){
        if(this.state.jokes.length === 0){
            this.getJokes();
        }
    }
    handleVote(id, delta) {
        this.setState(
            st => ({
                jokes: st.jokes.map(j =>
                    j.id === id ? {...j, votes: j.votes + delta} : j
                    )
            }),
            () => 
                window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }
    handleClick() {
        this.setState({loading: true}, this.getJokes);
    }
    render(){
        if(this.state.loading){
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">loading...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8935/5401c4ee-e703-4f89-9f52-ae174ef235e7.svg" alt="laughing-emoji"/>
                    <button className="JokeList-getmore" onClick={this.handleClick}>fetch jokes</button>
                </div>               
                <div className="JokeList-jokes">
                    <ul>
                        {jokes.map(j => (
                            <Joke votes={j.votes} text={j.text} key={j.id} upvote={() => this.handleVote(j.id, 1)} downvote={() => this.handleVote(j.id, -1)} />
                        ))} 
                    </ul>
                </div>
            </div>
        )
    }
}

export default JokeList;