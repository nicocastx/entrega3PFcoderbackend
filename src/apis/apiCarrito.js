//const {Carrito, dbCarritos} = require('../persistencia/carritoPerst')
import {cCarrito} from '../persistencia/contenedorCart.js'

const DBCarritos = new cCarrito()

const postCarrito = (req, res) =>{
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

/*const getCarrito = (req, res) =>{
    const {emailC} = req. params
    DBCarritos.getById(id)
    .then(data =>{
        if (data != undefined){
            res.send(data.productos)
            return
        }
        res.send({error: -2, descripcion: 'el carrito pedido no existe'})
    })
}*/

const postProdCarrito = (req, res) =>{
    const {emailC, idprod} = req.params
    DBCarritos.addProdCarrito(id, idprod)
    res.send({exito: 'exito'})
}

const delProdCarrito = (req, res) =>{
    const {emailC, idprod} = req.params
    DBCarritos.delProdCarrito(id, idprod)
    res.send({exito: 'exito'})
}

export {postCarrito, delCarrito,getByClientCarrito,postProdCarrito,delProdCarrito}
