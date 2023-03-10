import {Router} from 'express'
import * as APICarrito from '../apis/apiCarrito.js'

const routerCarrito = Router()

routerCarrito.post('/', APICarrito.postCarrito)

routerCarrito.delete('/:id', APICarrito.delCarrito)

routerCarrito.get('/:emailC/productos', APICarrito.getByClientCarrito)

routerCarrito.post('/:emailC/productos/:idprod', APICarrito.postProdCarrito)

routerCarrito.delete('/:emailC/productos/:idprod', APICarrito.delProdCarrito)

export default {routerCarrito}