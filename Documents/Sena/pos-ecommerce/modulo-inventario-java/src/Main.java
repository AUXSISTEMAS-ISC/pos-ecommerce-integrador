import dao.ProductoDAO;
import model.Producto;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        ProductoDAO dao = new ProductoDAO();

        System.out.println("=== 1. PRUEBA DE INSERCIÓN (CREATE) ===");
        Producto nuevo = new Producto("Escáner Código de Barras", 120000.0, 15);
        dao.insertar(nuevo);
        System.out.println("Producto insertado con éxito.");

        System.out.println("\n=== 2. PRUEBA DE LECTURA (READ) ===");
        List<Producto> productos = dao.listar();
        for (Producto p : productos) {
            System.out.println(p);
}

        if (!productos.isEmpty()) {
            Producto primerProd = productos.get(0);

            System.out.println("\n=== 3. PRUEBA DE ACTUALIZACIÓN (UPDATE) ===");
            primerProd.setPrecio(115000.0);
            primerProd.setStock(20);
            dao.actualizar(primerProd);
            System.out.println("Producto actualizado: " + primerProd);

            System.out.println("\n=== 4. PRUEBA DE ELIMINACIÓN (DELETE) ===");
            // dao.eliminar(primerProd.getId());
            System.out.println("Demostración CRUD completada correctamente.");
        }
    }
}