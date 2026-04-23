import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/CajaHerramientas.css'
import axiosInstance from '../utils/axiosConfig'
import { getImageUrl } from '../utils/imageUtils'
import { useCart } from '../context/CartContext'

const STEP_LABELS = [
  'Selecciona tu porta herramientas',
  'Selecciona las herramientas necesarias',
  'Selecciona los insumos necesarios',
  'Revisa tu selección y finaliza'
]

const fetchCategory = async (category) => {
  const { data } = await axiosInstance.get(`/api/products/category/${category}`)
  return data?.products || data || []
}

const ProductoCard = ({ producto, selected, onToggle }) => (
  <div
    className={`ch-card ${selected ? 'ch-card-selected' : ''}`}
    onClick={() => onToggle(producto)}
  >
    <div className='ch-card-image'>
      <img src={getImageUrl(producto.imagen?.[0] || producto.imagen || producto.imagenes?.[0])} alt={producto.item} />
    </div>
    <div className='ch-card-body'>
      <p className='ch-card-title'>{producto.item}</p>
      {producto.precio && (
        <p className='ch-card-price'>
          ${Number(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      )}
    </div>
    <div className='ch-card-badge'>{selected ? 'Seleccionado' : 'Elegir'}</div>
  </div>
)

const CajaHerramientas = () => {
  const navigate = useNavigate()
  const { addProductToCart, cart } = useCart()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [portaH, setPortaH] = useState([])
  const [herramientasMotorizadas, setHerramientasMotorizadas] = useState([])
  const [herramientasManuales, setHerramientasManuales] = useState([])
  const [insumos, setInsumos] = useState([])

  const [selectedPortaH, setSelectedPortaH] = useState(null)
  const [selectedHerramientas, setSelectedHerramientas] = useState([])
  const [selectedInsumos, setSelectedInsumos] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [porta, motorizadas, manuales, ins] = await Promise.all([
          fetchCategory('portaH'),
          fetchCategory('motorizadas'),
          fetchCategory('manuales'),
          fetchCategory('insumos')
        ])
        setPortaH(porta)
        setHerramientasMotorizadas(motorizadas)
        setHerramientasManuales(manuales)
        setInsumos(ins)
      } catch (err) {
        console.error('Error al cargar productos:', err)
        setError('No pudimos cargar los productos. Intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const togglePortaH = (producto) => {
    setSelectedPortaH((prev) => (prev?._id === producto._id ? null : producto))
  }

  const toggleHerramienta = (producto) => {
    setSelectedHerramientas((prev) => {
      const exists = prev.some((p) => p._id === producto._id)
      return exists ? prev.filter((p) => p._id !== producto._id) : [...prev, producto]
    })
  }

  const toggleInsumo = (producto) => {
    setSelectedInsumos((prev) => {
      const exists = prev.some((p) => p._id === producto._id)
      return exists ? prev.filter((p) => p._id !== producto._id) : [...prev, producto]
    })
  }

  const allSelected = useMemo(
    () => ({
      portaH: selectedPortaH ? [selectedPortaH] : [],
      herramientas: selectedHerramientas,
      insumos: selectedInsumos
    }),
    [selectedHerramientas, selectedInsumos, selectedPortaH]
  )

  const handleNext = () => {
    if (step === 0 && !selectedPortaH) return
    setStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1))
  }

  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0))

  const handleAddToCart = async () => {
    const productosAAgregar = [
      ...allSelected.portaH,
      ...allSelected.herramientas,
      ...allSelected.insumos
    ]

    if (productosAAgregar.length === 0) return

    setSaving(true)
    try {
      let lastCart = cart
      for (const prod of productosAAgregar) {
        lastCart = await addProductToCart(prod._id || prod.id, 1, prod)
      }
      if (lastCart?._id || lastCart?.id) {
        navigate(`/carrito/${lastCart._id || lastCart.id}`)
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err)
      setError('No pudimos agregar los productos al carrito. Intenta otra vez.')
    } finally {
      setSaving(false)
    }
  }

  const renderStepContent = () => {
    if (loading) {
      return <div className='ch-feedback'>Cargando productos...</div>
    }
    if (error) {
      return <div className='ch-feedback ch-error'>{error}</div>
    }

    switch (step) {
      case 0:
        return (
          <div className='ch-grid'>
            {portaH.map((producto) => (
              <ProductoCard
                key={producto._id || producto.id}
                producto={producto}
                selected={selectedPortaH?._id === producto._id}
                onToggle={togglePortaH}
              />
            ))}
          </div>
        )
      case 1:
        return (
          <>
            <p className='ch-subtitle'>Motorizadas</p>
            <div className='ch-grid'>
              {herramientasMotorizadas.map((producto) => (
                <ProductoCard
                  key={producto._id || producto.id}
                  producto={producto}
                  selected={selectedHerramientas.some((p) => p._id === producto._id)}
                  onToggle={toggleHerramienta}
                />
              ))}
            </div>
            <p className='ch-subtitle'>Manuales</p>
            <div className='ch-grid'>
              {herramientasManuales.map((producto) => (
                <ProductoCard
                  key={producto._id || producto.id}
                  producto={producto}
                  selected={selectedHerramientas.some((p) => p._id === producto._id)}
                  onToggle={toggleHerramienta}
                />
              ))}
            </div>
          </>
        )
      case 2:
        return (
          <div className='ch-grid'>
            {insumos.map((producto) => (
              <ProductoCard
                key={producto._id || producto.id}
                producto={producto}
                selected={selectedInsumos.some((p) => p._id === producto._id)}
                onToggle={toggleInsumo}
              />
            ))}
          </div>
        )
      case 3:
        return (
          <div className='ch-resumen'>
            <h3>Porta herramientas</h3>
            <div className='ch-pill-row'>
              {selectedPortaH ? (
                <span className='ch-pill'>{selectedPortaH.item}</span>
              ) : (
                <span className='ch-pill ch-pill-empty'>No seleccionado</span>
              )}
            </div>

            <h3>Herramientas elegidas</h3>
            <div className='ch-pill-row'>
              {selectedHerramientas.length === 0 && <span className='ch-pill ch-pill-empty'>No seleccionaste herramientas</span>}
              {selectedHerramientas.map((p) => (
                <span key={p._id || p.id} className='ch-pill'>{p.item}</span>
              ))}
            </div>

            <h3>Insumos elegidos</h3>
            <div className='ch-pill-row'>
              {selectedInsumos.length === 0 && <span className='ch-pill ch-pill-empty'>No seleccionaste insumos</span>}
              {selectedInsumos.map((p) => (
                <span key={p._id || p.id} className='ch-pill'>{p.item}</span>
              ))}
            </div>

            <div className='ch-actions'>
              <button
                className='ch-primary'
                onClick={handleAddToCart}
                disabled={saving || !selectedPortaH}
              >
                {saving ? 'Agregando...' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='ch-container'>
      <div className='ch-header'>
        <h1>Armá tu caja de herramientas</h1>
        <p className='ch-step'>{`Paso ${step + 1} de 4: ${STEP_LABELS[step]}`}</p>
      </div>

      <div className='ch-content'>{renderStepContent()}</div>

      <div className='ch-navigation'>
        <button className='ch-secondary' onClick={handlePrev} disabled={step === 0}>
          Anterior
        </button>
        {step < STEP_LABELS.length - 1 && (
          <button
            className='ch-primary'
            onClick={handleNext}
            disabled={step === 0 && !selectedPortaH}
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  )
}

export default CajaHerramientas