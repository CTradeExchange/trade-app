// 检验手机号是否正确
export function mobile(value) {
  const mobileReg = /^(13|14|15|16|17|18|19)\d{9}$/
  return mobileReg.test(value)
}

// 检验邮箱是否正确
export function mail(value) {
  const emailReg = new RegExp('^\\s*\\w+(?:\\.{0,1}[\\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\\.[a-zA-Z]+\\s*$')
  return emailReg.test(value)
}

// 检验银行卡是否正确
export function bank(value) {
  const bankNoReg = /^([1-9]{1})(\d{11}|\d{15}|\d{16}|\d{17}|\d{18})$/
  return bankNoReg.test(value)
}

const check = {
  mobile,
  mail,
  bank
}

export default check
