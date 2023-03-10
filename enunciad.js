//!ATENCION: COSAS A TENER EN CUENTA EN LA ENTREGA DE 3PF
/**
 * !Menu de registro y login usuarios con passport local, guardando en BD los registros
 * la imagen se guardara en public y se accedera por url, la contraseñá se debe encriptar antes
 *
 * !Formulario de registro y login, luego de concretarse la operacion
 * el usuario se redijira a /
 * el usuario se loguea con mail y password, tendra acceso a un menu en su vista,
 * como barra de navegacion. Puede ver los productos tottales con filtros que se hayan implementado
 * tambien usara un carrito de compras e informacion propia(los de registro y fotos) y
 * opcion para desloguearse del sistema
 * cuando se incorpore un usuario, el servidor envia un mail al administrador con todos los
 * datos del registro y con asunto de 'nuevo registro', a una direccion guardada en una
 * constante global
 *
 * !Envio de un mail y un mensaje de whatsapp al administrador desde el servidor, a un
 * !numero de contacto almacenado en una constante global
 * el usuario inicia la accion de pedido en la vista de carrito
 * se envia aqui una vez finalizada la eleccion para realizar la compra de productos
 * el email tendra en su cuerpo la lista completa de productos a comprar, y el asunto la frase de
 * nuevo pedido de y el nombre ye mail de usuario que los solicito, en el mensaje de whatsapp
 * se debe enviar informacion del asunto del mail
 * el usuario recibira un mensaje de texto al numero que haya registrado, indicando que su
 * pedido se recibio y se encuentra en proceso
 *
 * !ASPECTOS A TENER EN CUENTA:
 * trabajar en mongo atlas en forma local y cuando se despliegue a railways
 *
 * opcionalmente, habilitar el modo cluster por una constante global
 *
 * utilizar loggers para mensajes de errores moderados o graves guardandolos en un archivo
 *
 * realizar una prueba de performance en modo local, con y sin cluster, usando artillery en endpoint del
 * listado de productos(con el usuario logueado), verifciar resultados
 * !revisar si hay que utilizar sockets
 */