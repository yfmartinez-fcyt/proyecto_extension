const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const {
  isValidId,
  validateRegister,
  validateUpdateUser
} = require('../utils/validators');

const {
  ROLES_USUARIO
} = require('../utils/constants');


/**
 * Obtener todos los usuarios
 * Solo administradores
 */
const getAllUsers = async (req, res) => {
  try {

    if (req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });
    }


    const result = await pool.query(
      `
      SELECT 
        id,
        email,
        username,
        nombre,
        apellido,
        rol,
        activo,
        creado_en
      FROM usuarios
      ORDER BY creado_en DESC
      `
    );


    res.json({
      success: true,
      data: result.rows
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Error al listar usuarios'
    });

  }
};



/**
 * Crear usuario
 * POST /usuarios
 */
const createUser = async (req, res) => {

  try {

    const validation = validateRegister(req.body);


    if (!validation.valid) {

      return res.status(400).json({
        success: false,
        message: validation.message
      });

    }


    const {
      email,
      username,
      password,
      nombre,
      apellido,
      rol
    } = validation.data;


    // Verificar duplicados antes del INSERT
    const existe = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE email=$1
      OR username=$2
      `,
      [
        email,
        username
      ]
    );


    if (existe.rows.length > 0) {

      return res.status(409).json({
        success: false,
        message: 'El email o username ya están registrados'
      });

    }


    const hash = await bcrypt.hash(password, 10);


    const result = await pool.query(
      `
      INSERT INTO usuarios
      (
        email,
        username,
        password_hash,
        nombre,
        apellido,
        rol
      )
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING 
        id,
        email,
        username,
        nombre,
        apellido,
        rol
      `,
      [
        email,
        username,
        hash,
        nombre,
        apellido,
        rol
      ]
    );


    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: result.rows[0]
    });


  } catch (error) {

    console.error(error);


    if (error.code === '23505') {

      return res.status(409).json({
        success: false,
        message: 'El email o username ya existen'
      });

    }


    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });

  }

};



/**
 * Actualizar usuario
 * PUT /usuarios/:id
 */
const updateUser = async (req, res) => {

  try {

    const { id } = req.params;


    if (!isValidId(id)) {

      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });

    }


    const esAdmin = req.user.rol === 'admin';


    if (!esAdmin && req.user.id !== Number(id)) {

      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este usuario'
      });

    }


    const validation =
      validateUpdateUser(
        req.body,
        {
          allowRol: esAdmin,
          allowEmail: esAdmin
        }
      );


    if (!validation.valid) {

      return res.status(400).json({
        success: false,
        message: validation.message
      });

    }


    const actual =
      await pool.query(
        'SELECT * FROM usuarios WHERE id=$1',
        [id]
      );


    if (!actual.rows[0]) {

      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });

    }


    const current = actual.rows[0];


    const {
      nombre,
      apellido,
      email,
      username,
      rol
    } = validation.data;



    if (email && email !== current.email) {

      const existeEmail =
        await pool.query(
          `
          SELECT id 
          FROM usuarios 
          WHERE email=$1
          AND id<>$2
          `,
          [
            email,
            id
          ]
        );


      if (existeEmail.rows.length) {

        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });

      }

    }



    if (username && username !== current.username) {

      const existeUsername =
        await pool.query(
          `
          SELECT id 
          FROM usuarios
          WHERE username=$1
          AND id<>$2
          `,
          [
            username,
            id
          ]
        );


      if (existeUsername.rows.length) {

        return res.status(409).json({
          success: false,
          message: 'El username ya está registrado'
        });

      }

    }



    const result =
      await pool.query(
        `
        UPDATE usuarios
        SET
          nombre=$1,
          apellido=$2,
          email=$3,
          username=$4,
          rol=$5
        WHERE id=$6

        RETURNING
          id,
          nombre,
          apellido,
          email,
          username,
          rol
        `,
        [
          nombre ?? current.nombre,
          apellido ?? current.apellido,
          esAdmin
            ? (email ?? current.email)
            : current.email,
          username ?? current.username,
          esAdmin ? (rol ?? current.rol) : current.rol,
          id
        ]
      );



    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: result.rows[0]
    });



  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });

  }

};



/**
 * Obtener sesiones
 * Solo admin
 */
const getAllSessions = async (req, res) => {

  try {

    if (req.user.rol !== 'admin') {

      return res.status(403).json({
        success: false,
        message: 'No autorizado'
      });

    }


    const result = await pool.query(`
    SELECT
        rt.id,
        rt.usuario_id,
        rt.creado_en,
        rt.expires_at,
        u.nombre,
        u.apellido,
        u.email,
        (rt.expires_at > CURRENT_TIMESTAMP) AS activa
    FROM refresh_tokens rt
    INNER JOIN usuarios u
        ON u.id = rt.usuario_id
    ORDER BY rt.creado_en DESC
`);


    res.json({
      success: true,
      data: result.rows
    });


  } catch (error) {

    console.error('Error en getAllSessions:', error);

    res.status(500).json({
      success: false,
      message: 'Error al obtener sesiones'
    });

  }
};

const getMyProfile = async(req,res)=>{
  try{

    const result = await pool.query(
      `
      SELECT 
        id,
        nombre,
        apellido,
        username,
        email,
        rol,
        creado_en
      FROM usuarios
      WHERE id=$1
      `,
      [req.user.id]
    );


    if(!result.rows[0]){
      return res.status(404).json({
        success:false,
        message:'Usuario no encontrado'
      });
    }


    res.json({
      success:true,
      data:result.rows[0]
    });


  }catch(error){
    console.error(error);

    res.status(500).json({
      success:false,
      message:'Error al obtener perfil'
    });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  getAllSessions,
  getMyProfile
};