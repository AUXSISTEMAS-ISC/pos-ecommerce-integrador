package dao;

import config.ConexionBD;
import model.Producto;
import java.util.ArrayList;
import java.util.List;

public class ProductoDAO {
    private List<Producto> tablaProductos = new ArrayList<>();
    private int contadorId = 1;

    public ProductoDAO() {
        ConexionBD.probarConexion();
    }

    // 1. CREATE
    public boolean insertar(Producto producto) {
        producto.setId(contadorId++);
        tablaProductos.add(producto);
        return true;
    }

    // 2. READ
    public List<Producto> listar() {
        return tablaProductos;
    }

    // 3. UPDATE
    public boolean actualizar(Producto producto) {
        for (Producto p : tablaProductos) {
            if (p.getId() == producto.getId()) {
                p.setNombre(producto.getNombre());
                p.setPrecio(producto.getPrecio());
                p.setStock(producto.getStock());
                return true;
            }
        }
        return false;
    }

    // 4. DELETE
    public boolean eliminar(int id) {
        return tablaProductos.removeIf(p -> p.getId() == id);
    }
}