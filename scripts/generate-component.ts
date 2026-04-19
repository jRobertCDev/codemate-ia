import * as fs from 'fs'
import * as path from 'path'

const componentName = process.argv[2]

if (!componentName) {
  console.error('❌ Especificá el nombre del componente: npm run generate:component NombreComponente')
  process.exit(1)
}

// Validar que el nombre sea PascalCase
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error('❌ El nombre debe ser PascalCase. Ejemplo: MessageBubble')
  process.exit(1)
}

const componentDir = path.join(process.cwd(), 'components', componentName)

// Verificar que no exista ya
if (fs.existsSync(componentDir)) {
  console.error(`❌ El componente ${componentName} ya existe`)
  process.exit(1)
}

// Crear la carpeta
fs.mkdirSync(componentDir, { recursive: true })

// Archivo de tipos
const typesContent = `export interface ${componentName}Props {
  className?: string
  children?: React.ReactNode
}
`

// Componente
const componentContent = `'use client'

import { ${componentName}Props } from './${componentName}.types'

export function ${componentName}({ className, children }: ${componentName}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default ${componentName}
`

// Tests
const testContent = `import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ${componentName} } from './${componentName}'

describe('${componentName}', () => {
  it('renderiza correctamente', () => {
    render(<${componentName}>contenido de prueba</${componentName}>)
    expect(screen.getByText('contenido de prueba')).toBeInTheDocument()
  })

  it('aplica className correctamente', () => {
    const { container } = render(<${componentName} className="test-class" />)
    expect(container.firstChild).toHaveClass('test-class')
  })
})
`

// Escribir los archivos
fs.writeFileSync(path.join(componentDir, `${componentName}.types.ts`), typesContent)
fs.writeFileSync(path.join(componentDir, `${componentName}.tsx`), componentContent)
fs.writeFileSync(path.join(componentDir, `${componentName}.test.tsx`), testContent)

console.log(`✅ Componente ${componentName} creado exitosamente`)
console.log(`   📁 components/${componentName}/`)
console.log(`   ├── ${componentName}.tsx`)
console.log(`   ├── ${componentName}.types.ts`)
console.log(`   └── ${componentName}.test.tsx`)