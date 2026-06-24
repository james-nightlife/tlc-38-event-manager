import React from 'react'
import { useNavigate } from 'react-router-dom'

const SignIn = () => {
  const navigate = useNavigate();


  const users = [
    {
      username: 'swu',
      password: 'swu'
    },
  ]
  const handleSubmit = async (e) => {
    e.preventDefault()
    const username = e.target.username.value;

    const result = users.filter((x) => ((x.username === username) && (x.password === e.target.password.value)))
    console.log(result)
    if(result.length !== 1){
      alert('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง')
      return;
    }
    localStorage.setItem('username', username);
    navigate('/');
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type='text' name='username' />
        <input type='password' name='password' />
        <button type='submit'>ลงชื่อเข้าใช้งาน</button>
      </form>
    </>
  )
}

export default SignIn