import React, { Component } from 'react';
import axios from 'axios';
import './App.scss';
import SearchBar from './components/SearchBar/SearchBar';
import NewsCard from './components/NewsCard/NewsCard';
import InfiniteScroll from 'react-infinite-scroller';

const perPage = 10;

class App extends Component {
  constructor(props){
    super(props);
    this.news = [];
    this.maxNews = 100;
    this.page = 0;
    this.accmulate = 0;

    this.state = {
      keywords: '',
      filteredList: []
    }
    this.getNews = this.getNews.bind(this);
    this.filterNews = this.filterNews.bind(this);
  }

  getNews() {
    this.page++;
    let numOfItems = perPage;
    let remainItems = this.maxNews - this.accmulate;
    let currentPage = this.page;
    if (remainItems > 0) {
      if (remainItems < perPage) {
        numOfItems = remainItems;
        currentPage = this.maxNews/numOfItems;
      }
      axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          domains: 'wsj.com,nytimes.com',
          apiKey: '741a1f03a9bc470a8761aba57ee24731',
          pageSize: numOfItems,
          page: currentPage
        }
      }).then(res => {
        if (res.data.totalResults < this.maxNews) this.maxNews = res.data.totalResults;
        this.accmulate += res.data.articles.length;
        this.news = this.news.concat(res.data.articles);
        this.setState({
          filteredList: this.getFilteredList()
        });
      }).catch(err => {
        console.log(err);
      })
    }
  }

  filterNews(val) {
    this.setState({keywords: val.toLowerCase()});
    this.setState({filteredList: this.getFilteredList()});
  }

  getFilteredList() {
    let items = this.news;
    items = items.filter(item => {
        return (item.title.toLowerCase().search(this.state.keywords) !== -1 || item.description.toLowerCase().search(this.state.keywords) !== -1);
    });
    return items;
  }

  render() {
    return (
      <div className="App">
        <SearchBar filterNews={(val) => this.filterNews(val)}/>
        <InfiniteScroll pageStart={0} loadMore={this.getNews} hasMore={(this.page === 0 || this.accmulate < this.maxNews)} threshold={50}>
          <div className="card-section">
            { 
              this.state.filteredList.map((item, index) => 
                <NewsCard key={index}
                  title={item.title} 
                  description={item.description} 
                  image={item.urlToImage} 
                  name={item.source.name} 
                  date={item.publishedAt} 
                  link={item.url}>
                </NewsCard>
              )
            }
          </div>
        </InfiniteScroll>
      </div>
    );
  };
}

export default App;
