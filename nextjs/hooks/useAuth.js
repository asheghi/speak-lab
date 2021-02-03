import {useState} from "react";
import {fetchQuery} from "../lib/Fetch";
import {setCookie} from "../lib/helpers";
const ISSERVER = typeof window === "undefined";

export default function useAuth() {
    const [user, setUser] = useState(undefined);
    if (user === undefined)
        try {
            const AuthedUser = `
                query {
                  user: authenticatedUser {
                    id
                    _label_
                  }
                }
            `
            fetchQuery(AuthedUser)
                .then(({user}) => {
                    console.log('currentUserResponse', user);
                    if (!ISSERVER) {
                        localStorage.setItem('user', user);
                    }
                    setUser(user);
                })
        } catch (e) {
            console.error(e)
        }
    console.log('useEffect is running in front-end');

    const login = async (email, password) => {
        const query = `
        mutation($email:String!,$password:String!){
            login:authenticateUserWithPassword(email:$email,password:$password){
                item{
                    name
                    email
                    isAdmin
                    id
                    _label_
                    __typename
                }
                token
            }
        }
        `
        try {
            const {login: {item,token}} = await fetchQuery(query, {email, password});
            setCookie('keystone.pid',token,30);
            setUser(item);
        } catch (e) {
            console.error(e);
        }
    }
    const logout = async () => {
        const query = `
        mutation{
          logout: unauthenticateUser{
            success
          }
        }
        `
        try {
            const {logout: {success}} = await fetchQuery(query, )
            if (success) {
                setUser(undefined);
            }
        } catch (e) {
            console.error(e);
        }
    }
    return {user,login , logout}
}