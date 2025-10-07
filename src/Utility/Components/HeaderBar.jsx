import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
const HeaderBar = ({ title, onBackPress, onFilterPress, filterHide, backIconHide }) => {
  return (
    <View style={styles.headerBar}>
      {/* {!backIconHide && */}
        <AntDesign
          name="arrowleft"
          size={30}
          color="white"
          style={styles.arrowleftIcon}
          onPress={onBackPress}
        />
      {/* } */}
      <Text style={styles.headerText}>{title}</Text>
      {
        !filterHide &&

        // <Fontisto
        //   name="filter"
        //   size={26}
        //   color="white"
        //   style={styles.filterIcon}
        //   onPress={onFilterPress}
        // />
        <TouchableOpacity onPress={onFilterPress}>
          <Image
            source={require('../Public/images/filter.png')}
            style={[styles.headerSearchIcon, { width: 30, height: 30 }]}
            resizeMode="stretch" // or "cover", "stretch", etc.
          />
        </TouchableOpacity>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: '#007667',
    padding: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: '#fff',
    //marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
    flex: 1,
  },
  arrowleftIcon: {
    height: 30,
  },
  filterIcon: {
    height: 26,
    marginTop: 3,
  },
  headerSearchIcon: {
    // lineHeight: 24,
   // backgroundColor: 'red',
},
});

export default HeaderBar;
