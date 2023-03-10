import {contenedorDBMA} from '../persistencia/contenedorDBMA.js'
import { prodModel } from '../models/productos.js'

const DBProducto = new contenedorDBMA(prodModel)

const getProds = (req, res) => {
    const {
        id
    } = req.params
    if (id != undefined) {
        DBProducto.getById(id)
            .then(data => {
                res.send(data)
            })
        return
    }
    DBProducto.getAll()
        .then(data => {
            res.send(data)
        })
}

const postProds = (req, res) => {
    const {
        body
    } = req
    const prod = {nombre:body.nombre, descripcion: body.descripcion, codigo: body.codigo, url: body.url, precio: body.precio, stock: body.stock}
    DBProducto.save(prod)
    res.send({
        exito: 'exito'
    })
}

const putProds = (req, res) => {
    const {
        id
    } = req.params
    const {
        body
    } = req
    const prod = {nombre:body.nombre, descripcion: body.descripcion, codigo: body.codigo, url: body.url, precio: body.precio, stock: body.stock, timestamp: Date.now()}
    prod.id = Number(id)
    DBProducto.save(prod)
    res.send({
        id: id
    })
}

const delProds = (req, res) => {
    const {
        id
    } = req.params
    DBProducto.deleteById(id)
    res.send({
        exito: 'exito'
    })
}

export {getProds, postProds, putProds, delProds}
