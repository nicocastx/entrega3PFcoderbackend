import mongoose from 'mongoose'

export class contenedorDBMA{
    constructor(model){
        this.model = model
    }
    async getAll(){
        return await this.model.find()
    }

    async save(obj){
        return this.model.insertMany(obj)
    }

    async getById(id){
        return await this.model.find({_id: new mongoose.Types.ObjectId(id)})
    }

    async deleteById(id){
        return await this.model.deleteOne({_id: mongoose.Types.ObjectId(id)})
    }
}