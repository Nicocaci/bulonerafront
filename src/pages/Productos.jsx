import React from 'react'
import '../css/ProductosPage.css'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosConfig'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUtils'


const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('')
  const [filtroMarca, setFiltroMarca] = useState('')
  const [mostrarMarcas, setMostrarMarcas] = useState(true)
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalProductos, setTotalProductos] = useState(0)
  const productosPorPagina = 12
  const logo = [
    "ronixlogo.png",
    "logo-crossmaster.png",
    "logo-bahco.svg",
    "logo-bremen.svg",
    "logo-bosch.svg",
    "logo-skil.png",
    "logo-fischer.webp",
    "logo-venturo.jpg"
  ]

  // Leer los parámetros de la URL al cargar el componente
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria')
    const subcategoriaParam = searchParams.get('subcategoria')
    const marcaParam = searchParams.get('marca')
    console.log('🔎 searchParams al montar/cambiar:', { categoriaParam, subcategoriaParam, marcaParam });

    if (categoriaParam) {
      setFiltroCategoria(categoriaParam)
      setPaginaActual(1)
      setMostrarMarcas(false)
    }

    if (subcategoriaParam) {
      setFiltroSubcategoria(subcategoriaParam)
      setPaginaActual(1)
      setMostrarMarcas(false)
    }

    if (marcaParam) {
      setFiltroMarca(marcaParam)
      setPaginaActual(1)
      setMostrarMarcas(false)
    }
  }, [searchParams])

  // Obtener todas las subcategorías disponibles
  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        // Intentar obtener subcategorías desde un endpoint del backend
        try {
          const response = await axiosInstance.get('/api/products/subcategorias')
          if (response.data && Array.isArray(response.data)) {
            setSubcategorias(response.data)
            return
          }
        } catch (err) {
          // Si el endpoint no existe, extraer subcategorías de todos los productos
          console.log('Endpoint de subcategorías no disponible, extrayendo de productos...', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          })
        }

        // Obtener todos los productos para extraer subcategorías únicas
        const response = await axiosInstance.get('/api/products', {
          params: { limit: 1000 } // Obtener muchos productos para tener todas las subcategorías
        })

        const productosData = response.data?.products || response.data || []
        const subcategoriasUnicas = [...new Set(
          productosData
            .map(p => p.subcategoria)
            .filter(sub => sub && sub.trim() !== '')
        )].sort()

        setSubcategorias(subcategoriasUnicas)
      } catch (err) {
        console.error('Error al obtener subcategorías:', err)
        // Si falla, las subcategorías se actualizarán cuando se carguen los productos
      }
    }

    fetchSubcategorias()
  }, []) // Solo se ejecuta una vez al montar

  // Actualizar subcategorías cuando se cargan productos (fallback si el endpoint no existe)
  useEffect(() => {
    if (productos.length > 0 && subcategorias.length === 0) {
      const subcategoriasUnicas = [...new Set(
        productos
          .map(p => p.subcategoria)
          .filter(sub => sub && sub.trim() !== '')
      )].sort()

      if (subcategoriasUnicas.length > 0) {
        setSubcategorias(subcategoriasUnicas)
      }
    }
  }, [productos, subcategorias.length])

  // Filtrar subcategorías según la categoría seleccionada
  useEffect(() => {
    const actualizarSubcategoriasFiltradas = async () => {
      if (!filtroCategoria) {
        // Si no hay categoría seleccionada, mostrar todas las subcategorías
        setSubcategoriasFiltradas(subcategorias)
        return
      }

      try {
        // Obtener productos de la categoría seleccionada para extraer sus subcategorías
        const response = await axiosInstance.get(`/api/products/category/${filtroCategoria}`, {
          params: { limit: 1000 } // Obtener muchos productos para tener todas las subcategorías
        })

        const productosData = response.data?.products || response.data || []
        const subcategoriasDeCategoria = [...new Set(
          productosData
            .map(p => p.subcategoria)
            .filter(sub => sub && sub.trim() !== '')
        )].sort()

        setSubcategoriasFiltradas(subcategoriasDeCategoria)
      } catch (err) {
        console.error('Error al obtener subcategorías de la categoría:', err)
        // Si falla, usar todas las subcategorías como fallback
        setSubcategoriasFiltradas(subcategorias)
      }
    }

    actualizarSubcategoriasFiltradas()
  }, [filtroCategoria, subcategorias])

  // Obtener productos del backend (con filtro de categoría o subcategoría si existe)
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true)
        setError(null)

        // Leer la query actual directamente desde searchParams (prioridad a la URL)
        const categoriaDesdeUrl = searchParams.get('categoria') || ''
        const subcategoriaDesdeUrl = searchParams.get('subcategoria') || ''
        const marcaDesdeUrl = searchParams.get('marca') || ''

        // Si no hay ningún filtro en la URL y estamos en la vista inicial, no cargamos productos
        if (!categoriaDesdeUrl && !subcategoriaDesdeUrl && !marcaDesdeUrl && mostrarMarcas) {
          setLoading(false)
          return
        }

        // Si preferís priorizar el estado local, podés usar:
        // const categoria = filtroCategoria || categoriaDesdeUrl
        // pero en este enfoque usamos directamente la URL para evitar condiciones de carrera
        const categoria = categoriaDesdeUrl
        const subcategoria = subcategoriaDesdeUrl
        const marca = marcaDesdeUrl

        // Construir URL según filtros (priorizando marca > subcategoria > categoria)
        let url = '/api/products'
        if (marca) {
          url = `/api/products/brand/${encodeURIComponent(marca)}`
        } else if (subcategoria) {
          url = `/api/products/subcategory/${encodeURIComponent(subcategoria)}`
        } else if (categoria) {
          url = `/api/products/category/${encodeURIComponent(categoria)}`
        }

        const params = {
          page: paginaActual,
          limit: productosPorPagina
        }

        console.log('🧾 fetchProductos =>', { url, params, categoria, subcategoria, marca })

        try {
          const response = await axiosInstance.get(url, { params })
          console.log('📦 Respuesta del backend:', response.data)

          const result = response.data
          if (result.products && Array.isArray(result.products)) {
            setProductos(result.products)
            setProductosFiltrados(result.products)

            const pagination = result.pagination || {}
            setTotalPaginas(pagination.totalPages || Math.ceil((pagination.total || 0) / productosPorPagina))
            setTotalProductos(pagination.total || result.products.length)
          } else {
            // Fallback si backend devuelve array directamente
            const arr = Array.isArray(result) ? result : []
            setProductos(arr)
            setProductosFiltrados(arr)
            setTotalProductos(arr.length)
          }
        } catch (err) {
          // Si hubo un error y hay filtro por marca, intentamos un fallback: obtener muchos productos y filtrar en cliente por marca
          console.warn('Intentando fallback por marca...', err?.message || err)
          if (marca) {
            try {
              const responseAll = await axiosInstance.get('/api/products', { params: { limit: 1000 } })
              const all = responseAll.data?.products || responseAll.data || []
              const filtrados = all.filter(p => p.marca && p.marca.toLowerCase().includes(marca.toLowerCase()))

              setTotalProductos(filtrados.length)
              setTotalPaginas(Math.ceil(filtrados.length / productosPorPagina) || 1)
              // Aplicar paginación en cliente
              const start = (paginaActual - 1) * productosPorPagina
              const pageItems = filtrados.slice(start, start + productosPorPagina)
              setProductos(pageItems)
              setProductosFiltrados(pageItems)
            } catch (err2) {
              console.error('Error al obtener productos por marca (fallback):', err2)
              setError(err2.response?.data?.message || 'Error al cargar los productos')
            }
          } else {
            console.error('Error al obtener productos:', err)
            setError(err.response?.data?.message || 'Error al cargar los productos')
          }
        }
      } catch (err) {
        console.error('Error al obtener productos:', err)
        setError(err.response?.data?.message || 'Error al cargar los productos')
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
    // Agregamos searchParams para que cuando cambie la query (p.ej. /productos?categoria=manuales) se dispare el fetch
  }, [searchParams, paginaActual, mostrarMarcas]) // Se ejecuta cuando cambia la categoría, subcategoría, marca, la página o la vista de marcas

  // Filtrar por nombre en el frontend (búsqueda de texto)
  // Nota: El filtro de subcategoría se hace en el backend
  useEffect(() => {
    let productosFiltrados = productos

    // Filtrar por nombre (solo si hay búsqueda de texto)
    if (filtroNombre.trim() !== '') {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.item?.toLowerCase().includes(filtroNombre.toLowerCase())
      )
    }

    setProductosFiltrados(productosFiltrados)
    // Resetear a la primera página cuando cambia el filtro de nombre
    if (filtroNombre.trim() !== '') {
      setPaginaActual(1)
    }
  }, [filtroNombre, productos])

  const limpiarFiltros = () => {
    setFiltroNombre('')
    setFiltroCategoria('')
    setFiltroSubcategoria('')
    setFiltroMarca('')
    setPaginaActual(1)
    setMostrarMarcas(true)
    // Limpiar también los parámetros de la URL
    setSearchParams({})
  }

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina)
    // Scroll al inicio de los productos
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getBrandDisplayNameFromFilename = (filename) => {
    if (!filename) return ''
    const withoutExt = filename.replace(/\.[^/.]+$/, '')
    let name = withoutExt
      .replace(/^logo[-_]?/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/logo$/i, '')
      .trim()
    // Capitalize words
    name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return name || filename
  }

  const handleSeleccionarMarca = (logoName) => {
    const marca = getBrandDisplayNameFromFilename(logoName)
    setFiltroMarca(marca)
    setPaginaActual(1)
    setMostrarMarcas(false)
    // Actualizar URL para que sea compartible / navegable
    setSearchParams({ marca })
  }

  if (loading) {
    return (
      <div className='container-productos'>
        <div className='loading-container'>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container-productos'>
        <div className='error-container'>
          <p className='error-message'>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container-productos'>

      {mostrarMarcas ? (
        <div className='marcas-inicial'>
          <h2>Buscar por marca</h2>
          <p>Seleccione una marca para ver sus productos.</p>
          <div className='grid-logo-marcas'>
            {logo.map((logoName, i) => (
              <div className='marca-container' key={i}>
                <img
                  src={`marcas/${logoName}`}
                  alt={`Logo ${logoName}`}
                  title={getBrandDisplayNameFromFilename(logoName)}
                  tabIndex={0}
                  role='button'
                  className='logo-marca'
                  onClick={() => handleSeleccionarMarca(logoName)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSeleccionarMarca(logoName) }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='marcas-selected-header'>
          <button className='btn-volver' onClick={() => { setFiltroMarca(''); setMostrarMarcas(true); setSearchParams({}) }}>Volver a marcas</button>
          {filtroMarca && <h2>Productos de {filtroMarca}</h2>}
        </div>
      )} 

      {!mostrarMarcas && (
      <div className='productos-layout'>
        <div className='filtros-container'>
          <div className='filtro-group'>
            <label htmlFor='filtro-nombre'>Buscar por nombre:</label>
            <input
              type='text'
              id='filtro-nombre'
              className='filtro-input'
              placeholder='Ej: Taladro, Amoladora...'
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          <div className='filtro-group'>
            <label htmlFor='filtro-categoria'>Categoría:</label>
            <select
              id='filtro-categoria'
              className='filtro-select'
              value={filtroCategoria}
              onChange={(e) => {
                const nuevaCategoria = e.target.value
                setFiltroCategoria(nuevaCategoria)
                setPaginaActual(1) // Resetear a la primera página cuando cambia la categoría
                // Limpiar subcategoría cuando cambia la categoría
                setFiltroSubcategoria('')
                // Actualizar la URL cuando se cambia el filtro manualmente
                if (nuevaCategoria) {
                  setSearchParams({ categoria: nuevaCategoria })
                } else {
                  setSearchParams({})
                }
              }}
            >
              <option value=''>Todas las categorías</option>
              <option value='motorizadas'>Herramientas Motorizadas</option>
              <option value='manuales'>Herramientas Manuales</option>
              <option value='insumos'>
                Insumos y Accesorios
              </option>
            </select>
          </div>

          <div className='filtro-group'>
            <label htmlFor='filtro-subcategoria'>Subcategoría:</label>
            <select
              id='filtro-subcategoria'
              className='filtro-select'
              value={filtroSubcategoria}
              onChange={(e) => {
                const nuevaSubcategoria = e.target.value
                setFiltroSubcategoria(nuevaSubcategoria)
                setPaginaActual(1) // Resetear a la primera página cuando cambia la subcategoría
                // Actualizar la URL cuando se cambia el filtro manualmente
                const params = {}
                if (filtroCategoria) params.categoria = filtroCategoria
                if (nuevaSubcategoria) params.subcategoria = nuevaSubcategoria
                setSearchParams(params)
              }}
            >
              <option value=''>Todas las subcategorías</option>
              {(filtroCategoria ? subcategoriasFiltradas : subcategorias).map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>

          {(filtroNombre || filtroCategoria || filtroSubcategoria || filtroMarca) && (
            <button className='btn-limpiar' onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>

        <div className='productos-grid'>
          {productosFiltrados.length === 0 ? (
            <div className='sin-productos'>
              <p>No se encontraron productos con los filtros aplicados.</p>
            </div>
          ) : (
            productosFiltrados.map((producto) => (
              <Link className='link-none' to={`/producto/${producto._id}`} key={producto._id || producto.id}>
                <div key={producto._id || producto.id} className='producto-card'>
                  <div className='producto-imagen-container'>
                    <img
                      src={getImageUrl(
                        // Usar siempre la primera imagen disponible
                        Array.isArray(producto.imagen)
                          ? producto.imagen[0]
                          : (Array.isArray(producto.imagenes)
                            ? producto.imagenes[0]
                            : producto.imagen)
                      )}
                      alt={producto.item || 'Producto'}
                      className='producto-imagen'
                      onError={(e) => {
                        const attemptedUrl = e.target.src;
                        console.error('❌ Error cargando imagen del producto:', {
                          producto: producto.item,
                          rutaOriginal: producto.imagen,
                          urlIntentada: attemptedUrl,
                          apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000'
                        });
                        e.target.src = '/vite.svg'
                      }}
                    />
                  </div>
                  <div className='producto-info'>
                    <h3 className='producto-nombre'>{producto.item || 'Sin nombre'}</h3>
                    <div className='producto-precio-container'>
                      <span className='producto-precio'>
                        ${producto.precio ? Number(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </span>
                      {producto.iva && (
                        <span className='producto-iva'>IVA: {producto.iva}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      )}

      {/* Controles de paginación */}
      {
        !mostrarMarcas && totalPaginas > 1 && (
          <div className='paginacion-container'>
            <div className='paginacion-info'>
              <p>
                Mostrando {productosFiltrados.length} de {totalProductos} productos
              </p>
            </div>

            <div className='paginacion-controls'>
              <button
                className='btn-paginacion'
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>

              <div className='paginacion-numeros'>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    numero === 1 ||
                    numero === totalPaginas ||
                    (numero >= paginaActual - 1 && numero <= paginaActual + 1)
                  ) {
                    return (
                      <button
                        key={numero}
                        className={`btn-pagina ${paginaActual === numero ? 'activa' : ''}`}
                        onClick={() => cambiarPagina(numero)}
                      >
                        {numero}
                      </button>
                    )
                  } else if (numero === paginaActual - 2 || numero === paginaActual + 2) {
                    return <span key={numero} className='paginacion-ellipsis'>...</span>
                  }
                  return null
                })}
              </div>

              <button
                className='btn-paginacion'
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default Productos;