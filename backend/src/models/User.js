import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { // ลำดับที่
    type: Number,
    unique: true
  },
  prefix: { // คำนำหน้า
    type: String,
    required: true
  },
  firstname: { // ชื่อตัว
    type: String,
    required: true
  },
  lastname: { // ชื่อสกุล
    type: String,
    required: true
  },
  university: { // สถาบันอุดมศึกษา (มหาวิทยาลัย / วิทยาลัย / สถาบัน)
    type: String,
    required: true
  },
  faculty: { // ส่วนราชการ / ส่วนงาน (คณะ / วิทยาลัย / สถาบัน / สำนัก)
    type: String,
    required: true
  },
  position: { // ตำแหน่ง
    type: String,
    required: true
  },
  tel: { // หมายเลขโทรศัพท์หน่วยงาน
    type: String
  },
  ext: { // หมายเลขต่อภายใน
    type: String
  },
  mobile: { // หมายเลขโทรศัพท์มือถือ
    type: String,
    required: true
  },
  email: { // อีเมล
    type: String,
    required: true,
    unique: true
  },
  food: { // ประเภทอาหาร
    type: String,
    required: true
  },
  filename: { // ชื่อไฟล์เอกสารอนุมัติเข้าร่วมงาน
    type: String,
    required: true
  },
  allowJoin: { // สถานะการอนุมัติ
    type: String,
    default: "รออนุมัติ"
  },
  code: { // เลขลำดับการเข้าร่วมงาน (อนุมัติแล้ว)
    type: String
  },
  allergy: { // แพ้อาหาร
    type: String
  },
  register: { // สถานะการลงทะเบียนเข้าร่วมงาน
    type: [String]
  },
  visit: { // สถานะการเข้าร่วมงาน
    type: [String]
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);