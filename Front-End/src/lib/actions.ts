import { error } from "console";

export async function login(email: string, password: string) {
  // Here you would implement your actual authentication logic

  if (!email || !password) {
    throw new Error("A senha ou email invalidos");
  }
  if (email==="Admin@gmail.com" && password==="1234") {
        const token=generateToken(email)
       localStorage.setItem('jwt',token)
   return {
    success: true,
   }
  }else{
    throw new Error("A senha e o email não coincidem");
  }
}
function generateToken(email:string){
  const header= JSON.stringify({alg:"HS256" , type: "JWT"});
  const payload = JSON.stringify({username:email, exp:Date.now() + 360000});
  const signature='jobera_nas_tecnicas';

  return btoa(header)+'.'+ btoa(payload)+'.'+ btoa(signature);
}
export function islogged(){
  const token=localStorage.getItem('jwt')
  if(!token) return false;
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));

  if (payload.exp < Date.now()) {
      localStorage.removeItem('jwt');
      return false;
  }
  return true;
}
