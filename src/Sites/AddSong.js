import React, { Component } from 'react';
import { Form, Label, Grid, Table, Button, Container, Header, Segment, Message, Icon } from 'semantic-ui-react';
import axios from 'axios';
import YouTube from 'react-youtube';

export default class AddSong extends Component {
  constructor(props) {
    super(props);

    this.onChangeSongName = this.onChangeSongName.bind(this);
    this.onChangeLink = this.onChangeLink.bind(this);
    this.onChangeComposers = this.onChangeComposers.bind(this);
    this.onChangeDropdown = this.onChangeDropdown.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.extractYoutubeId = this.extractYoutubeId.bind(this);
    this.playSong = this.playSong.bind(this);
    this.stopSong = this.stopSong.bind(this);

    this.state = {
      musicData: [],
      dropdownData: [],
      dropdownOptions: [],
      game: '',
      songname: '',
      link: '',
      youtubeId: '',
      composers: '',
      songs: [],
      loading: false,
      successMessage: '',
      errorMessage: '',
      currentPlayingSong: null,
      isPlaying: false,
    };
  }

  onChangeSongName(e) {
    this.setState({ songname: e.target.value });
  }

  onChangeLink(e) {
    const url = e.target.value;
    const youtubeId = this.extractYoutubeId(url);
    this.setState({ link: url, youtubeId });
  }

  onChangeComposers(e) {
    this.setState({ composers: e.target.value });
  }

  onChangeDropdown(e, { value }) {
    const game = value;
    const selectedGame = this.state.musicData.find(data => data.game === game);

    if (selectedGame) {
      const newSongs = selectedGame.songs.map((song, index) => ({
        id: index + 1,
        nr: index + 1,
        songname: song.name,
        link: song.link,
        approved: song.songapproved ? 'true' : 'false',
      }));

      this.setState({ game, songs: newSongs });
    }
  }

  extractYoutubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : '';
  }

  componentDidMount() {
    axios.get('https://vmq.onrender.com/getAll')
      .then(res => {
        const dropdownOptions = res.data.map(game => ({
          key: game.game,
          text: game.game,
          value: game.game,
        }));

        this.setState({ musicData: res.data, dropdownOptions });
      })
      .catch(error => {
        console.log(error);
      });
  }

  renderTableData() {
    return this.state.songs.map(song => (
      <Table.Row key={song.id}>
        <Table.Cell>{song.nr}</Table.Cell>
        <Table.Cell>{song.songname}</Table.Cell>
        <Table.Cell>{song.link}</Table.Cell>
        <Table.Cell>{song.approved}</Table.Cell>
        <Table.Cell style={{ width: '120px', textAlign: 'center' }}>
          <Button.Group>
            <Button icon onClick={() => this.playSong(song.link)} disabled={this.state.currentPlayingSong === song.link}>
              <Icon name='play' />
            </Button>
            {this.state.currentPlayingSong === song.link && (
              <Button icon onClick={this.stopSong}>
                <Icon name='stop' />
              </Button>
            )}
          </Button.Group>
        </Table.Cell>
      </Table.Row>
    ));
  }

  playSong(link) {
    this.setState({ currentPlayingSong: link, isPlaying: true });
  }

  stopSong() {
    this.setState({ currentPlayingSong: null, isPlaying: false });
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true });

    const songObject = {
      game: this.state.game,
      songs: {
        name: this.state.songname,
        link: this.state.youtubeId,
        composers: this.state.composers.split(', '),
        songapproved: false,
      },
    };

    axios.post('https://vmq.onrender.com/update', songObject)
      .then(res => {
        console.log(res.data);

        const newSong = {
          id: this.state.songs.length + 1,
          nr: this.state.songs.length + 1,
          songname: this.state.songname,
          link: this.state.youtubeId,
          approved: 'false',
        };

        this.setState(prevState => ({
          successMessage: 'Song successfully added!',
          errorMessage: '',
          loading: false,
          songname: '',
          link: '',
          youtubeId: '',
          composers: '',
          songs: [...prevState.songs, newSong],
        }));
      })
      .catch(error => {
        console.log(error);
        this.setState({
          errorMessage: 'An error occurred. Please try again later.',
          successMessage: '',
          loading: false,
        });
      });
  }

  render() {
    const { game, songname, link, youtubeId, composers, loading, successMessage, errorMessage, currentPlayingSong, isPlaying } = this.state;

    const videoOptions = {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 1,
      },
    };

    return (
      <Container>
        <Segment padded='very'>
          <Header as='h2' textAlign='center' color='teal'>Add New Song to Existing Game</Header>
          <Form onSubmit={this.onSubmit} loading={loading} error={!!errorMessage} success={!!successMessage}>
            <Form.Dropdown
              placeholder='Select Game'
              fluid
              selection
              search
              options={this.state.dropdownOptions}
              onChange={this.onChangeDropdown}
              value={game}
              required
            />

<Label style={{ marginBottom: '10px' }}>Song Information</Label>
            <Form.Group widths='equal'>
              <Form.Input
                label={<label>Songname</label>}
                placeholder='Songname e.g. Main Theme'
                name='songName'
                value={songname}
                onChange={this.onChangeSongName}
                required
              />
              <Form.Input
                label={<label>YouTube URL</label>}
                placeholder='YouTube URL e.g. https://youtu.be/UC_U0l2E-Rs'
                name='link'
                value={link}
                onChange={this.onChangeLink}
               
              />
              <Form.Input
                label={<label>YouTube ID</label>}
                placeholder='YouTube ID'
                name='youtubeId'
                value={youtubeId}
                readOnly
                required
              />
              <Form.Input
                label='Composers'
                placeholder='Composers e.g. Koji Kondo, Toby Fox'
                name='composers'
                value={composers}
                onChange={this.onChangeComposers}
              />
            </Form.Group>

            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Form.Button content='Submit' color='green' />
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <Message success header='Success' content={successMessage} />
            <Message error header='Error' content={errorMessage} />
          </Form>

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Nr</Table.HeaderCell>
                <Table.HeaderCell>Songname</Table.HeaderCell>
                <Table.HeaderCell>Link</Table.HeaderCell>
                <Table.HeaderCell>Approved</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.renderTableData()}
            </Table.Body>
          </Table>

          
        </Segment>
        {isPlaying && (
            <YouTube videoId={currentPlayingSong} opts={videoOptions} onEnd={this.stopSong} />
          )}
      </Container>
    );
  }
}
