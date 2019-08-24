import React from "react";
import { View, ListView, Text, StyleSheet } from "react-native";
import PropTypes from "prop-types";

export class RnWheelPickerJS extends React.Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: () => true });
    this.timer = null;
    this.momentumStart = false;
    this.dragStart = false;
    this.data = this.getData(props.data);
    this.state = {
      dataSource: this.ds.cloneWithRows(this.data),
      selectedIndex: props.data[props.selectedIndex]
        ? props.selectedIndex + 1
        : 0
    };
  }

  componentDidMount() {
    if (this.state.selectedIndex === undefined) {
      return;
    }

    setTimeout(() => {
      this.scrollToIndex(this.state.selectedIndex - 1);
    }, 0);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data.length !== nextProps.data.length) {
      this.data = this.getData(nextProps.data);

      if (!this.data[this.state.selectedIndex]) {
        this.setState({
          selectedIndex: nextProps.data.length
        });
      }

      this.setState({
        dataSource: this.ds.cloneWithRows(this.data)
      });
    }
  }

  getData = optionsData => {
    const { optionsCount } = this.props;

    return this.createEmptyArray(optionsCount / 2).concat(
      optionsData.concat(this.createEmptyArray(optionsCount / 2))
    );
  };

  createEmptyArray = arrayLength => {
    return new Array(Math.floor(arrayLength)).fill(" ");
  };

  onMomentumScrollEnd = event => {
    const el = {
      nativeEvent: {
        contentOffset: {
          y: event.nativeEvent.contentOffset.y
        }
      }
    };

    this.momentumStart = false;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (!this.dragStart) {
      this.selectOption(el);
    }
  };

  onMomentumScrollBegin = () => {
    this.momentumStart = true;

    if (this.timer) {
      clearTimeout(this.timer);
    }
  };

  onScrollBeginDrag = () => {
    this.dragStart = true;

    if (this.timer) {
      clearTimeout(this.timer);
    }
  };

  onScrollEndDrag = event => {
    const el = {
      nativeEvent: {
        contentOffset: {
          y: event.nativeEvent.contentOffset.y
        }
      }
    };

    this.dragStart = false;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if (!this.dragStart && !this.momentumStart) {
        this.selectOption(el);
      }
    }, 10);
  };

  selectOption = event => {
    const { optionsCount, optionHeight } = this.props;
    const y = event.nativeEvent.contentOffset
      ? event.nativeEvent.contentOffset.y
      : 0;
    const selectedIndex = Math.round(y / optionHeight);
    const selectedIndexWithEmptyBlock =
      selectedIndex + Math.floor(optionsCount / 2);

    this.setState({
      selectedIndex: selectedIndexWithEmptyBlock,
      dataSource: this.ds.cloneWithRows(this.data)
    });
    this.scrollToIndex(selectedIndex);

    if (this.props.onValueChange) {
      this.props.onValueChange(
        this.data[selectedIndexWithEmptyBlock],
        selectedIndex
      );
    }
  };

  scrollToIndex(index) {
    const { optionHeight } = this.props;

    this.listRef.scrollTo({ y: index * optionHeight });
  }

  render() {
    const {
      optionsCount,
      optionsWrapperWidth,
      optionHeight,
      highlightBorderWidth,
      highlightBorderColor,
      itemColor,
      activeItemColor,
      wrapperBackground
    } = this.props;

    const highlightVarStyle = {
      top: Math.floor(optionsCount * 0.5) * optionHeight,
      height: optionHeight,
      borderTopWidth: highlightBorderWidth,
      borderBottomWidth: highlightBorderWidth,
      borderTopColor: highlightBorderColor,
      borderBottomColor: highlightBorderColor
    };

    return (
      <View
        style={[
          {
            height: optionHeight * optionsCount,
            width: optionsWrapperWidth,
            backgroundColor: wrapperBackground
          },
          styles.container
        ]}
      >
        <View style={[highlightVarStyle, styles.highlight]} />
        <ListView
          enableEmptySections
          dataSource={this.state.dataSource}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onMomentumScrollBegin={this.onMomentumScrollBegin}
          onScrollEndDrag={this.onScrollEndDrag}
          onScrollBeginDrag={this.onScrollBeginDrag}
          bounces={false}
          initialListSize={this.data.length}
          ref={ref => {
            this.listRef = ref;
          }}
          renderRow={(data, _, id) => (
            <View style={[{ height: optionHeight }, styles.itemWrapper]}>
              <Text
                style={[
                  { color: itemColor },
                  id == this.state.selectedIndex && { color: activeItemColor }
                ]}
              >
                {data}
              </Text>
            </View>
          )}
        />
      </View>
    );
  }
}

RnWheelPickerJS.propTypes = {
  optionsCount: PropTypes.number,
  optionsWrapperWidth: PropTypes.number,
  optionHeight: PropTypes.number,
  data: PropTypes.array,
  selectedIndex: PropTypes.number,
  highlightBorderWidth: PropTypes.number,
  highlightBorderColor: PropTypes.string,
  activeItemColor: PropTypes.string,
  itemColor: PropTypes.string,
  wrapperBackground: PropTypes.string
};

RnWheelPickerJS.defaultProps = {
  optionsCount: 3,
  optionsWrapperWidth: 100,
  optionHeight: 60,
  data: [],
  selectedIndex: 0,
  highlightBorderWidth: 1,
  highlightBorderColor: "#333",
  activeItemColor: "#222121",
  itemColor: "#B4B4B4",
  wrapperBackground: "#fff"
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center"
  },
  itemWrapper: {
    alignItems: "center",
    justifyContent: "center"
  },
  highlight: {
    width: "100%",
    position: "absolute"
  }
});
