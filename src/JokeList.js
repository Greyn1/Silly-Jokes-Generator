import React, { Component } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './JokeList.css'
import Joke from './Joke';
class JokeList extends Component {

    static defaultProps = {
        numJokesToGet: 10
    };

    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("Jokes") || "[]"),
            isLoading: false
        };
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        if (this.state.jokes.length === 0){
            this.setState({
                isLoading: true
            },this.getJokes);
        }
    }

    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j =>
                j.id === id ? { ...j, votes: j.votes + delta } : j)
        }), 
        () => window.localStorage.setItem("Jokes", JSON.stringify(this.state.jokes)));
    }

    async getJokes() {
        let jokes = [];
        while (jokes.length < this.props.numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } });
            let newJoke = res.data.joke;
            if(!this.seenJokes.has(newJoke)){
                jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
            }else{
                console.log("Found a duplicate - ",newJoke);
            }
        }
        // this.setState({
        //     jokes: jokes
        // });
        // window.localStorage.setItem("Jokes", JSON.stringify(jokes));
        this.setState(st => ({
            jokes: [...st.jokes, ...jokes],
            isLoading: false
        }), 
        () => window.localStorage.setItem("Jokes", JSON.stringify(this.state.jokes)));
    }

    handleClick() {
        this.setState({
            isLoading: true
        }, this.getJokes);
    }

    render() {
        if(this.state.isLoading){
            return (
                <div className='spinner'>
                    <i className='far fa-8x fa-laugh fa-spin' ></i>
                    <h1 className='JokeList-title'>Loading...</h1>
                </div>
            );
        }
        let sortedJokeList = this.state.jokes.sort((a,b) => b.votes - a.votes);
        return (
            <div className='JokeList'>
                <div className='JokeList-sidebar'>
                    <h1 className='JokeList-title'>
                        <span>Dad</span> Jokes
                    </h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="" />
                    <button className='JokeList-getmore' onClick={this.handleClick} >New Jokes</button>
                </div>
                <div className='JokeList-jokes'>
                    {sortedJokeList.map(j => (
                        <Joke key={j.id}
                            votes={j.votes}
                            text={j.text}
                            upvote={() => this.handleVote(j.id, 1)}
                            downvote={() => this.handleVote(j.id, -1)} />
                    ))}
                </div>
            </div>
        );
    }
}

export default JokeList;