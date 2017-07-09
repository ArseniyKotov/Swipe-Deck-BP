import React, { Component } from 'react';
import { View, Animated, PanResponder, Dimensions, StyleSheet } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESH = 0.25 * SCREEN_WIDTH;
const DURATION = 250;

const styles = new StyleSheet.create({
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    marginTop: 10,
  }
})

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    renderNoMoreCards: () => {},
  }

  constructor(props) {
    super(props);
    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESH) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESH) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      },
    });
    this.state = { panResponder, position, index: 0 };
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.setState({
      index : this.state.index + 1
    });
    this.state.position.setValue({ x: 0, y: 0 });
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg'],
    });

    return {
      ...this.state.position.getLayout(),
      transform: [{ rotate }],
    };
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: DURATION,
    }).start(() => {
      this.onSwipeComplete(direction);
    });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 },
    }).start();
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }
    return this.props.data.map((element, i) => {
      if (i < this.state.index) {
        return null;
      } else if (i === this.state.index) {
        return (
          <Animated.View
            key={element.id}
            {...this.state.panResponder.panHandlers}
            style={[this.getCardStyle(), styles.cardStyle]}
          >
            {this.props.renderCard(element)}
          </Animated.View>
        );
      } else {
        return (
          <Animated.View key={element.id} style={styles.cardStyle}>
            {this.props.renderCard(element)}
          </Animated.View>
        )
      };
    }).reverse();
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Deck;
