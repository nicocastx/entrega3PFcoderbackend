/**
 *  consiste en crear una cuenta en el servidor almacenada en la base de datos
 * , que contenga el email y password de usuario, además de su nombre, dirección
 * , edad, número de teléfono (debe contener todos los prefijos internacionales)
 *  y foto ó avatar. La contraseña se almacenará encriptada en la base de datos.
 */

import mongoose from 'mongoose'

const userCol = 'usuarios'

const userSchema = mongoose.Schema({
  email:{type:String, required: true},
  password: {type: String, required: true},
  nombre: {type: String, required: true},
  direccion: {type: String, required: true},
  edad: {type: Number, required: true},
  nroTelefono: {type: String, required: true},
  urlAvatar: {type: String}
})

export const userModel = mongoose.model(userCol, userSchema)