import { contenedorDBMA } from "./contenedorDBMA.js";
import { cartModel } from "../models/carritos.js";
import { prodModel } from "../models/productos.js";

const dbProductos = new contenedorDBMA(prodModel);

export class contenedorCarrito extends contenedorDBMA {
  constructor() {
    super(cartModel);
  }

  async save(emailC) {
    return this.model.insertMany({
      emailCliente: emailC,
      productos: [],
    });
  }

  async getByClient(emailC) {
    return this.model.find({ emailCliente: emailC });
  }

  async deleteByEmailC(emailC) {
    return await this.model.deleteOne({ emailCliente: emailC });
  }

  async addProdCarrito(emailC, idProd) {
    const prod = await dbProductos.getById(idProd);
    return await this.model.updateOne(
      {
        emailCliente: emailC
      },
      {
        $push: {
          productos: prod[0],
        },
      }
    );
  }

  async delProdCarrito(emailC, idProd) {
    const carts = await this.model.find({ emailCliente: emailC })
    console.log(carts);
    const i = carts[0].productos.findIndex(prod => {
      return prod._id.toString() == idProd
    })
    carts[0].productos.splice(i, 1)
    return this.model.replaceOne({
      emailCliente: emailC
    },
    carts[0]
    );
  }
}
