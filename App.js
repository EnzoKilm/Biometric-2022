/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TextInput,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  let [canRegister, setCanRegister] = React.useState(false)
  let [canLogin, setCanLogin] = React.useState(false)
  let [isLogin, setIsLogin] = React.useState(false)

  let [firstname, setFirstname] = React.useState(null)
  let [lastname, setLastname] = React.useState(null)

  const checkLogin = async () => {
    const firstname = await AsyncStorage.getItem('firstname')
    if (firstname) {
      setCanLogin(true)
      setCanRegister(false)
    } else {
      setCanLogin(false)
      setCanRegister(true)
    }
  }
  checkLogin()

  const login = async () => {
    ReactNativeBiometrics.biometricKeysExist()
      .then((resultObject) => {
        const { keysExist } = resultObject

        if (keysExist) {
          ReactNativeBiometrics.simplePrompt({promptMessage: 'Confirm fingerprint'})
            .then(async (resultObject) => {
              const { success } = resultObject

              if (success) {
                setFirstname(await AsyncStorage.getItem('firstname'))
                setLastname(await AsyncStorage.getItem('lastname'))

                setIsLogin(true)
                setCanLogin(false)
                setCanRegister(false)
              }
            })
            .catch((error) => {
              alert("Biometric verification failed.")
            })
        } else {
          alert("Seems like you don't have an existing account.")
        }
      })
  }

  const register = async () => {
    if (registerFirstname && registerLastname) {
      ReactNativeBiometrics.simplePrompt({promptMessage: 'Confirm fingerprint'})
        .then((resultObject) => {
          const { success } = resultObject

          if (success) {
            ReactNativeBiometrics.createKeys('Confirm fingerprint')
              .then(async (resultObject) => {
                const { publicKey } = resultObject

                AsyncStorage.setItem(
                  'firstname',
                  registerFirstname
                )
                await AsyncStorage.setItem(
                  'lastname',
                  registerLastname
                )
                alert("You are successfully registered.")

                setCanRegister(false)
                setCanLogin(true)
              })
          }
        })
        .catch(() => {
          alert("Biometric verification failed.")
        })
    } else {
      alert("Please fill all available fields.")
    }
  }

  const logout = () => {
    setIsLogin(false)
    setCanLogin(true)
  }

  const deleteAccount = async () => {
    await AsyncStorage.removeItem('firstname').then(async () => {
      await AsyncStorage.removeItem('lastname').then(() => {
        setIsLogin(false)
        setCanLogin(false)
        setCanRegister(true)
      })
    })
  }

  const [registerFirstname, onChangeRegisterFirstname] = React.useState(null)
  const [registerLastname, onChangeRegisterLastname] = React.useState(null)

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            display: 'flex',
            padding: 20,
          }}>
          {canLogin && !isLogin
            ? (<View>
              <Text style={styles.sectionTitle}>Login</Text>
              <Button
                title="Login"
                onPress={login}
              />
              </View>)
            : null
          }

          {isLogin
            ? (<View>
              <Text style={styles.sectionTitle}>Welcome{"\n"}{firstname} {lastname}</Text>
              <View style={styles.button}>
                <Button
                  title="Logout"
                  onPress={logout}
                />
              </View>
              <Button
                title="Delete my account"
                onPress={deleteAccount}
              />
              </View>)
            : null
          }

          {canRegister
           ? (<View>
            <Text style={styles.sectionTitle}>Register</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChangeRegisterFirstname}
              value={registerFirstname}
              placeholder="Firstname"
            />
            <TextInput
              style={styles.input}
              onChangeText={onChangeRegisterLastname}
              value={registerLastname}
              placeholder="Lastname"
            />
            <Button
              title="Save"
              onPress={register}
            />
            </View>)
           : null
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    marginBottom: 10,
  },
});

export default App;
