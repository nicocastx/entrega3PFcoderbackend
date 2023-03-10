import mongoose from 'mongoose'

const colCart = 'carritos'

const schCart = new mongoose.Schema({
  emailCliente:{type: String, required: true},
  productos:{type:Array, required: true}
})

export const cartModel = mongoose.model(colCart, schCart)