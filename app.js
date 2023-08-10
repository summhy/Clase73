import pg from "pg";
const {Pool} = pg;
const pool = new Pool({
    host:"localhost",
    user: "susanamunoz",
    password:"",
    database: "ercompleto",
    port:5432
    
});

pool.connect();


async function reserva(id_libro, id_usuario){
    //identificar si el usuario existe
    try{
        await pool.query("BEGIN");
        const resultUser  = await pool.query("select id  from usuarios where id = $1",[id_usuario]);  
        if(resultUser.rowCount >0){
            console.log('Usuario encontrado');
             //identificar si el libro existe //validar stock del libro
            const resultBook = await pool.query("select id from libros where id= $1 and stock>0",[id_libro]); 
            if(resultBook.rowCount>0){
                console.log("Libro encontrado");
                //hacer la reserva
                const resultReserva = await pool.query("insert into reservas (id_libro, id_usuario) values ($1, $2) RETURNING ID", [id_libro, id_usuario]);
                //console.log(resultReserva);
                if(resultReserva.rowCount>0){
                    console.log(`Reserva ${resultReserva.rows[0].id} generada`)
                     //bajar el stock
                     const resultStock = await pool.query("update libro set stock=stock-1 where id =$1", [id_libro]);
                     if(resultStock.rowCount>0){
                        console.log("Stock Rebajado")
                        await pool.query("COMMIT");
                     }else{
                        await pool.query("ROLLBACK");
                     }
                }
            }else{
                console.log("Libro no encontrado");
                await pool.query("ROLLBACK");
            }
        }else{
            console.log("Usuario no encontrado");
            await pool.query("ROLLBACK");
        }
    }catch(e){
        console.log("Error2");
        await pool.query("ROLLBACK");
    }finally {
        pool.release;
    }
    
}

async function ejemplo(){
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // aquí puedes realizar la operación en la base de datos
        await client.query('INSERT INTO usuarios (nombre, apellido) values($1,$2)',['Susana', ' Muñoz']);
        await client.query('COMMIT');
        res.send('Operación completada');
    } catch (e) {
        await client.query('ROLLBACK');
        next(e);
    } finally {
        client.release();
    }
}

reserva(4,14);