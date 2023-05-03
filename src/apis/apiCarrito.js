//const {Carrito, dbCarritos} = require('../persistencia/carritoPerst')
import {contenedorCarrito} from '../persistencia/contenedorCart.js'

const DBCarritos = new contenedorCarrito()

const postCarrito = (req, res) =>{
    const {
        emailC
    } = req.params
    DBCarritos.save(emailC)
    .then(id => res.send({idCarrito : id}))
}

const delCarrito = (req, res) =>{
    const {
        emailC
    } = req.params
    DBCarritos.delCarrito(emailC)
    res.send({
        exito: 'exito'
    })
}

const getByClientCarrito = (req, res) =>{
    const {emailC} = req.params
    DBCarritos.getByClient(emailC)
    .then(cart =>{
        res.send(cart)
    })
}

const postProdCarrito = (req, res) =>{
    const {emailC, idprod} = req.params
    DBCarritos.addProdCarrito(emailC, idprod)
    res.send({exito: 'exito'})
}

const delProdCarrito = (req, res) =>{
    const {emailC, idprod} = req.params
    DBCarritos.delProdCarrito(emailC, idprod)
    res.send({exito: 'exito'})
}

export {postCarrito, delCarrito,getByClientCarrito,postProdCarrito,delProdCarrito}
