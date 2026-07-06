import { useNavigate } from "react-router-dom";
import users from "../assets/users.json";

const SignIn = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;

    const result = users.filter(
      (x) => x.username === username && x.password === e.target.password.value,
    );
    console.log(result);
    if (result.length !== 1) {
      alert("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    localStorage.setItem("username", username);
    localStorage.setItem("role", result[0].role);
    navigate("/");
  };

  return (
    <>
      <div className="flex justify-center p-4">
        <form
          className="flex flex-col gap-4 border p-4"
          onSubmit={handleSubmit}
        >
          <h1>ระบบรับลงทะเบียนเข้าร่วมงาน</h1>
          <div>ชื่อผู้ใช้งาน</div>
          <input type="text" name="username" />
          <div>รหัสผ่าน</div>
          <input type="password" name="password" />
          <button type="submit">ลงชื่อเข้าใช้งาน</button>
        </form>
      </div>
    </>
  );
};

export default SignIn;
