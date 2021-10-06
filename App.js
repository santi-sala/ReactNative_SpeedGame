import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View,
  useWindowDimensions,
  StyleSheet,
  Text,
  Button,
  ScrollView,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Header, Body, Title, Left, Right, Icon } from 'native-base';
import Dialog from 'react-native-dialog';

import Realm from 'realm';

import { useFonts } from 'expo-font';

export default function App() {
  // const [loaded] = useFonts({
  //   Roboto: require('native-base/Fonts/Roboto.ttf'),
  //   Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
  // });

  // if (!loaded) {
  //   return null;
  // }
  const [timeOne, setTimeOne] = useState(0);
  const [score, setScore] = useState(0);

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [name, setName] = useState('');

  const [index, setIndex] = useState(0);

  const [players, setPlayers] = useState([]);

  const layout = useWindowDimensions();

  const FirstRoute = () => (
    <View style={[styles.scene, { backgroundColor: '#fff' }]}>
      <Text style={styles.text}>Double tap the circle as fast as you can!</Text>
      <View style={styles.circle} onTouchStart={circlePressed} />
      <Text style={styles.text}>Time: {score}</Text>
      <View style={styles.row}>
        <View style={styles.button}>
          <Button
            title="Add highscores"
            onPress={() => setAddDialogVisible(true)}
          />
        </View>
        <View style={styles.button}>
          <Button title="Reset time" onPress={resetScore} />
        </View>
      </View>
    </View>
  );

  const resetScore = () => {
    setTimeOne(0);
    setScore(0);
  };

  const circlePressed = () => {
    // get start time - first press
    if (timeOne === 0) {
      const date = new Date();
      setTimeOne(date.getTime());
      setScore(0);
      // second press, calc time and store
    } else {
      const date = new Date();
      setScore(date.getTime() - timeOne);
    }
  };

  const SecondRoute = () => (
    <View style={[styles.scene, { backgroundColor: '#fff' }]}>
      <ScrollView>
        {players.map((player, index) => {
          return (
            <View key={index} style={styles.highscore}>
              <Text style={styles.highscoreName}>{player.name}</Text>
              <Text style={styles.highscoreScore}>{player.score}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });

  const [routes] = React.useState([
    { key: 'first', title: 'Game' },
    { key: 'second', title: 'Highscores' },
  ]);

  const Player = {
    name: 'Player',
    properties: {
      name: 'string',
      score: { type: 'int', default: 0 },
    },
  };

  const realm = new Realm({ schema: [Player] });

  const indexChange = (index) => {
    // change tab index from code
    setIndex(index);

    // more code later here, load HS when tab 1 is selected == hs tab
    if (index === 1) {
      // load highscores
      let players = realm.objects('Player').sorted('score');
      let playersArray = Array.from(players);
      setPlayers(playersArray);
    }
  };

  const okClicked = () => {
    setAddDialogVisible(false);
    // add highscore
    realm.write(() => {
      const player = realm.create('Player', {
        name: name,
        score: score,
      });
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'coral' }}>
      <View>
        <Header style={{ backgroundColor: '#2196F3' }}>
          <Left>
            <Icon name="menu" style={{ color: '#fff' }} />
          </Left>
          <Body>
            <Title>SPEEDGAME</Title>
          </Body>
          <Right />
        </Header>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={indexChange}
        initialLayout={{ width: layout.width }}
      />
      <Dialog.Container visible={addDialogVisible}>
        <Dialog.Title>Add a new highscore</Dialog.Title>
        <Dialog.Input
          label="Name"
          placeholder="Click and type your name here"
          onChangeText={(text) => setName(text)}
        />
        <Dialog.Button label="Ok" onPress={okClicked} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 150 / 2,
    backgroundColor: 'red',
    alignSelf: 'center',
    marginTop: 100,
  },
  text: {
    marginTop: 50,
    alignSelf: 'center',
  },
  button: {
    marginRight: 20,
    marginTop: 50,
    alignSelf: 'center',
    width: 150,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  highscore: {
    flexDirection: 'row',
    margin: 10,
  },
  highscoreName: {
    fontSize: 20,
    color: 'black',
    width: '50%',
    textAlign: 'right',
    marginRight: 5,
  },
  highscoreScore: {
    fontSize: 20,
    color: 'gray',
    width: '50%',
    marginLeft: 5,
  },
});
