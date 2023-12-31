import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Connexion.scss';
import { AuthContext } from '../../Utils/AuthContext';
import { Circles } from 'react-loader-spinner';

const Connexion = () => {

    const { setLogged, setUserName, setToken } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMail, setErrorMail] = useState(false);
    const [errorMDP, setErrorMDP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingReconnect, setLoadingReconnect] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const localStorageToken = localStorage.getItem('token');
        const sessionStorageToken = sessionStorage.getItem('token');
        const localStorageUsername = localStorage.getItem('username');
        const sessionStorageUsername = sessionStorage.getItem('username');
      
        const verifyToken = async (token) => {
          setLoadingReconnect(true);
          try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/verify`, {
              token: token
            });
      
            if (response.status === 200) {
              setToken(token);
              setUserName(localStorageUsername || sessionStorageUsername);
              setLogged(true);
              navigate('/');
            }
          } catch (error) {
            if (error.response.status === 401 || error.response.status === 400 || error.response.status === 500) {
              setLogged(false);
              setUserName('');
              setToken('');
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('username');
              localStorage.removeItem('username');
              navigate('/');
            }
          }
        };
      
        if (localStorageToken || sessionStorageToken) {
          const tokenToVerify = localStorageToken || sessionStorageToken;
          verifyToken(tokenToVerify);
        } else {
          navigate('/connexion');
        }
      }, [navigate, setLogged, setToken, setUserName]);
      

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        axios.post(`${process.env.REACT_APP_BASE_URL}/users/login`, {
            email: email,
            password: password
        }).then((response) => {
            if (response.status === 200) {
                setUserName(response.data.username);
                setToken(response.data.token);
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('username', response.data.username);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                setLogged(true);
                navigate('/');
            } 
        }).catch((error) => {
            if (error.response.status === 401) {
                if(error.response.data.message === "Email invalide"){
                    setErrorMail(true);
                } else {
                    setErrorMail(false);
                }
                if(error.response.data.message === "Mot de passe incorrect"){
                    setErrorMDP(true);
                } else {
                    setErrorMDP(false);
                }
            }
            setLoading(false);
        })
    }

    const handleChangeMail = (e) => {
        setEmail(e.target.value);
    }

    const handleChangePassword = (e) => {
        setPassword(e.target.value);
    }


    return (
        <>
            <h1 className='h1-top'>Connexion</h1>
            { loadingReconnect ? (
                <div className="loader-page">
                    <Circles color='#070f4e' height={100} width={100} />
                </div>
            ) : (
                <form className='form-connexion' action="" onSubmit={handleSubmit}>
                <div className="input-box">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" placeholder="mail@mail.com" onChange={handleChangeMail} />
                </div>
                <span className="error">{errorMail && ("Ce mail ne correspond pas à un compte")}</span>
                <div className="input-box">
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" name="password" placeholder="********" onChange={handleChangePassword} />
                </div>
                <span className="error">{errorMDP && ("Mot de passe incorrect")}</span>
                {loading ? (
                    <div className="loader"><Circles color='#070f4e' height={40} width={40} /></div>
                ) : <button type="submit">Valider</button>}
            </form>
            )}
        </>
    );
}

export default Connexion;