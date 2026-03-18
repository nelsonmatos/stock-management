import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(days) {
  return new Date(Date.now() - days * 86400000)
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000)
}

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.movimento.deleteMany()
  await prisma.linhaEncomenda.deleteMany()
  await prisma.encomenda.deleteMany()
  await prisma.stockLocalizacao.deleteMany()
  await prisma.lote.deleteMany()
  await prisma.artigo.deleteMany()
  await prisma.localizacao.deleteMany()
  await prisma.fornecedor.deleteMany()

  // Create Localizacoes
  const [farCentral, armBloco, armUrg, armFrig, armGeral] = await Promise.all([
    prisma.localizacao.create({
      data: {
        codigo: 'FAR-CENTRAL',
        designacao: 'Farmácia Central',
        tipo: 'CENTRAL',
        responsavel: 'Dr. Ana Ferreira',
        temperaturaControlada: false,
        ativa: true
      }
    }),
    prisma.localizacao.create({
      data: {
        codigo: 'ARM-BLOCO',
        designacao: 'Armazém Bloco Operatório',
        tipo: 'AVANCADO',
        responsavel: 'Enf. Carlos Santos',
        temperaturaControlada: false,
        ativa: true
      }
    }),
    prisma.localizacao.create({
      data: {
        codigo: 'ARM-URG',
        designacao: 'Armazém Urgência',
        tipo: 'URGENCIA',
        responsavel: 'Enf. Maria Costa',
        temperaturaControlada: false,
        ativa: true
      }
    }),
    prisma.localizacao.create({
      data: {
        codigo: 'ARM-FRIG',
        designacao: 'Frigorífico Farmácia',
        tipo: 'FRIGORIFICO',
        responsavel: 'Dr. Ana Ferreira',
        temperaturaControlada: true,
        ativa: true
      }
    }),
    prisma.localizacao.create({
      data: {
        codigo: 'ARM-GERAL',
        designacao: 'Armazém Geral',
        tipo: 'CENTRAL',
        responsavel: 'João Pereira',
        temperaturaControlada: false,
        ativa: true
      }
    })
  ])

  // Create Fornecedores
  const [medinfar, generis, roche, labesfal, ocp] = await Promise.all([
    prisma.fornecedor.create({
      data: {
        codigo: 'FORN-001',
        nome: 'Medinfar',
        nif: '501234567',
        email: 'encomendas@medinfar.pt',
        telefone: '219000100',
        ativo: true
      }
    }),
    prisma.fornecedor.create({
      data: {
        codigo: 'FORN-002',
        nome: 'Generis',
        nif: '502345678',
        email: 'comercial@generis.pt',
        telefone: '219000200',
        ativo: true
      }
    }),
    prisma.fornecedor.create({
      data: {
        codigo: 'FORN-003',
        nome: 'Roche',
        nif: '503456789',
        email: 'hospital@roche.pt',
        telefone: '219000300',
        ativo: true
      }
    }),
    prisma.fornecedor.create({
      data: {
        codigo: 'FORN-004',
        nome: 'Labesfal',
        nif: '504567890',
        email: 'vendas@labesfal.pt',
        telefone: '219000400',
        ativo: true
      }
    }),
    prisma.fornecedor.create({
      data: {
        codigo: 'FORN-005',
        nome: 'OCP Portugal',
        nif: '505678901',
        email: 'logistica@ocp.pt',
        telefone: '219000500',
        ativo: true
      }
    })
  ])

  // Create Artigos
  const artigosData = [
    // Medicamentos
    {
      codigo: 'MED-001',
      descricao: 'Amoxicilina 500mg',
      dci: 'Amoxicilina',
      codigoAtc: 'J01CA04',
      familia: 'Antibióticos',
      subfamilia: 'Penicilinas',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Comprimido',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 100,
      stockMaximo: 1000,
      pontoEncomenda: 200,
      precoMedioPonderado: 0.15,
      unidadeMedidaCompra: 'Caixa',
      fatorConversao: 20
    },
    {
      codigo: 'MED-002',
      descricao: 'Paracetamol 1g IV',
      dci: 'Paracetamol',
      codigoAtc: 'N02BE01',
      familia: 'Analgésicos',
      subfamilia: 'Antipiréticos',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Frasco',
      necessitaLote: true,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 50,
      stockMaximo: 500,
      pontoEncomenda: 100,
      precoMedioPonderado: 2.50
    },
    {
      codigo: 'MED-003',
      descricao: 'Ibuprofeno 400mg',
      dci: 'Ibuprofeno',
      codigoAtc: 'M01AE01',
      familia: 'Anti-inflamatórios',
      subfamilia: 'AINEs',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Comprimido',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 200,
      stockMaximo: 2000,
      pontoEncomenda: 400,
      precoMedioPonderado: 0.08,
      unidadeMedidaCompra: 'Caixa',
      fatorConversao: 20
    },
    {
      codigo: 'MED-004',
      descricao: 'Omeprazol 20mg',
      dci: 'Omeprazol',
      codigoAtc: 'A02BC01',
      familia: 'Gastrointestinal',
      subfamilia: 'Inibidores da Bomba de Protões',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Cápsula',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 150,
      stockMaximo: 1500,
      pontoEncomenda: 300,
      precoMedioPonderado: 0.12,
      unidadeMedidaCompra: 'Caixa',
      fatorConversao: 28
    },
    {
      codigo: 'MED-005',
      descricao: 'Metformina 850mg',
      dci: 'Metformina',
      codigoAtc: 'A10BA02',
      familia: 'Antidiabéticos',
      subfamilia: 'Biguanidas',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Comprimido',
      necessitaLote: false,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 100,
      stockMaximo: 1000,
      pontoEncomenda: 200,
      precoMedioPonderado: 0.10
    },
    {
      codigo: 'MED-006',
      descricao: 'Atorvastatina 20mg',
      dci: 'Atorvastatina',
      codigoAtc: 'C10AA05',
      familia: 'Cardiovascular',
      subfamilia: 'Estatinas',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Comprimido',
      necessitaLote: false,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 80,
      stockMaximo: 800,
      pontoEncomenda: 160,
      precoMedioPonderado: 0.25
    },
    {
      codigo: 'MED-007',
      descricao: 'Insulina Glargina',
      dci: 'Insulina Glargina',
      codigoAtc: 'A10AE04',
      familia: 'Antidiabéticos',
      subfamilia: 'Insulinas',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Frasco',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'FRIO_2_8',
      validadeMinimaDias: 90,
      stockMinimo: 20,
      stockMaximo: 200,
      pontoEncomenda: 40,
      precoMedioPonderado: 45.00
    },
    {
      codigo: 'MED-008',
      descricao: 'Midazolam 5mg/ml',
      dci: 'Midazolam',
      codigoAtc: 'N05CD08',
      familia: 'Anestésicos',
      subfamilia: 'Benzodiazepinas',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Ampola',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: true,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 30,
      stockMaximo: 300,
      pontoEncomenda: 60,
      precoMedioPonderado: 3.80
    },
    {
      codigo: 'MED-009',
      descricao: 'Propofol 200mg',
      dci: 'Propofol',
      codigoAtc: 'N01AX10',
      familia: 'Anestésicos',
      subfamilia: 'Anestésicos IV',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Frasco',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 20,
      stockMaximo: 200,
      pontoEncomenda: 40,
      precoMedioPonderado: 8.50
    },
    {
      codigo: 'MED-010',
      descricao: 'Adrenalina 1mg',
      dci: 'Epinefrina',
      codigoAtc: 'C01CA24',
      familia: 'Cardiovascular',
      subfamilia: 'Vasopressores',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Ampola',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 40,
      stockMaximo: 400,
      pontoEncomenda: 80,
      precoMedioPonderado: 1.20
    },
    {
      codigo: 'MED-011',
      descricao: 'Heparina 5000UI',
      dci: 'Heparina Sódica',
      codigoAtc: 'B01AB01',
      familia: 'Anticoagulantes',
      subfamilia: 'Heparinas',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Ampola',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 60,
      stockMaximo: 600,
      pontoEncomenda: 120,
      precoMedioPonderado: 2.10
    },
    {
      codigo: 'MED-012',
      descricao: 'Morfina 10mg',
      dci: 'Morfina',
      codigoAtc: 'N02AA01',
      familia: 'Analgésicos',
      subfamilia: 'Opiáceos',
      tipo: 'MEDICAMENTO',
      unidadeMedida: 'Ampola',
      necessitaLote: true,
      requerPrescricao: true,
      psicotropico: true,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 20,
      stockMaximo: 200,
      pontoEncomenda: 40,
      precoMedioPonderado: 4.50
    },
    // Dispositivos Médicos
    {
      codigo: 'DIS-001',
      descricao: 'Seringa 5ml',
      dci: null,
      codigoAtc: null,
      familia: 'Injetáveis',
      subfamilia: 'Seringas',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 500,
      stockMaximo: 5000,
      pontoEncomenda: 1000,
      precoMedioPonderado: 0.08,
      unidadeMedidaCompra: 'Caixa',
      fatorConversao: 100
    },
    {
      codigo: 'DIS-002',
      descricao: 'Agulha 21G',
      dci: null,
      codigoAtc: null,
      familia: 'Injetáveis',
      subfamilia: 'Agulhas',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 500,
      stockMaximo: 5000,
      pontoEncomenda: 1000,
      precoMedioPonderado: 0.05
    },
    {
      codigo: 'DIS-003',
      descricao: 'Cateter IV 18G',
      dci: null,
      codigoAtc: null,
      familia: 'Cateterismo',
      subfamilia: 'Cateteres IV',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 200,
      stockMaximo: 2000,
      pontoEncomenda: 400,
      precoMedioPonderado: 0.85
    },
    {
      codigo: 'DIS-004',
      descricao: 'Compressas 10x10',
      dci: null,
      codigoAtc: null,
      familia: 'Pensos e Curativos',
      subfamilia: 'Compressas',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Embalagem',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 200,
      stockMaximo: 2000,
      pontoEncomenda: 400,
      precoMedioPonderado: 1.20
    },
    {
      codigo: 'DIS-005',
      descricao: 'Penso Rápido',
      dci: null,
      codigoAtc: null,
      familia: 'Pensos e Curativos',
      subfamilia: 'Pensos',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Caixa',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 100,
      stockMaximo: 1000,
      pontoEncomenda: 200,
      precoMedioPonderado: 2.50
    },
    {
      codigo: 'DIS-006',
      descricao: 'Fio de Sutura 3/0',
      dci: null,
      codigoAtc: null,
      familia: 'Cirurgia',
      subfamilia: 'Suturas',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Caixa',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 30,
      stockMaximo: 300,
      pontoEncomenda: 60,
      precoMedioPonderado: 18.00
    },
    {
      codigo: 'DIS-007',
      descricao: 'Bisturi n.22',
      dci: null,
      codigoAtc: null,
      familia: 'Cirurgia',
      subfamilia: 'Instrumental',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 50,
      stockMaximo: 500,
      pontoEncomenda: 100,
      precoMedioPonderado: 0.95
    },
    {
      codigo: 'DIS-008',
      descricao: 'Dreno Jackson-Pratt',
      dci: null,
      codigoAtc: null,
      familia: 'Cirurgia',
      subfamilia: 'Drenos',
      tipo: 'DISPOSITIVO_MEDICO',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 20,
      stockMaximo: 200,
      pontoEncomenda: 40,
      precoMedioPonderado: 12.50
    },
    // EPI
    {
      codigo: 'EPI-001',
      descricao: 'Luvas Latex M',
      dci: null,
      codigoAtc: null,
      familia: 'EPI',
      subfamilia: 'Luvas',
      tipo: 'EPI',
      unidadeMedida: 'Par',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 1000,
      stockMaximo: 10000,
      pontoEncomenda: 2000,
      precoMedioPonderado: 0.12
    },
    {
      codigo: 'EPI-002',
      descricao: 'Luvas Latex L',
      dci: null,
      codigoAtc: null,
      familia: 'EPI',
      subfamilia: 'Luvas',
      tipo: 'EPI',
      unidadeMedida: 'Par',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 800,
      stockMaximo: 8000,
      pontoEncomenda: 1600,
      precoMedioPonderado: 0.12
    },
    {
      codigo: 'EPI-003',
      descricao: 'Máscara Cirúrgica',
      dci: null,
      codigoAtc: null,
      familia: 'EPI',
      subfamilia: 'Máscaras',
      tipo: 'EPI',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 500,
      stockMaximo: 5000,
      pontoEncomenda: 1000,
      precoMedioPonderado: 0.15
    },
    {
      codigo: 'EPI-004',
      descricao: 'Máscara FFP2',
      dci: null,
      codigoAtc: null,
      familia: 'EPI',
      subfamilia: 'Máscaras',
      tipo: 'EPI',
      unidadeMedida: 'Unidade',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 300,
      stockMaximo: 3000,
      pontoEncomenda: 600,
      precoMedioPonderado: 0.95
    },
    // Consumíveis
    {
      codigo: 'CON-001',
      descricao: 'Soro Fisiológico 500ml',
      dci: 'Cloreto de Sódio 0,9%',
      codigoAtc: null,
      familia: 'Soluções IV',
      subfamilia: 'Soros',
      tipo: 'CONSUMIVEL',
      unidadeMedida: 'Frasco',
      necessitaLote: true,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 100,
      stockMaximo: 1000,
      pontoEncomenda: 200,
      precoMedioPonderado: 1.50
    },
    {
      codigo: 'CON-002',
      descricao: 'Soro Glicosado 5% 500ml',
      dci: 'Glucose 5%',
      codigoAtc: null,
      familia: 'Soluções IV',
      subfamilia: 'Soros',
      tipo: 'CONSUMIVEL',
      unidadeMedida: 'Frasco',
      necessitaLote: true,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 90,
      stockMinimo: 80,
      stockMaximo: 800,
      pontoEncomenda: 160,
      precoMedioPonderado: 1.80
    },
    {
      codigo: 'CON-003',
      descricao: 'Álcool Etílico 70%',
      dci: null,
      codigoAtc: null,
      familia: 'Desinfectantes',
      subfamilia: 'Álcoois',
      tipo: 'CONSUMIVEL',
      unidadeMedida: 'Frasco',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 50,
      stockMaximo: 500,
      pontoEncomenda: 100,
      precoMedioPonderado: 2.20
    },
    {
      codigo: 'CON-004',
      descricao: 'Gel Desinfectante 500ml',
      dci: null,
      codigoAtc: null,
      familia: 'Desinfectantes',
      subfamilia: 'Géis',
      tipo: 'CONSUMIVEL',
      unidadeMedida: 'Frasco',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 100,
      stockMaximo: 1000,
      pontoEncomenda: 200,
      precoMedioPonderado: 3.50
    },
    {
      codigo: 'CON-005',
      descricao: 'Algodão Hidrófilo',
      dci: null,
      codigoAtc: null,
      familia: 'Pensos e Curativos',
      subfamilia: 'Algodão',
      tipo: 'CONSUMIVEL',
      unidadeMedida: 'Rolo',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 365,
      stockMinimo: 50,
      stockMaximo: 500,
      pontoEncomenda: 100,
      precoMedioPonderado: 1.80
    },
    {
      codigo: 'CON-006',
      descricao: 'Sabão Antisséptico 500ml',
      dci: null,
      codigoAtc: null,
      familia: 'Desinfectantes',
      subfamilia: 'Sabões',
      tipo: 'CONSUMIVEL',
      unidadeMedida: 'Frasco',
      necessitaLote: false,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'AMBIENTE',
      validadeMinimaDias: 180,
      stockMinimo: 80,
      stockMaximo: 800,
      pontoEncomenda: 160,
      precoMedioPonderado: 4.20
    },
    // Reagentes
    {
      codigo: 'REA-001',
      descricao: 'Reagente Glicose',
      dci: null,
      codigoAtc: null,
      familia: 'Reagentes',
      subfamilia: 'Bioquímica',
      tipo: 'REAGENTE',
      unidadeMedida: 'Kit',
      necessitaLote: true,
      requerPrescricao: false,
      psicotropico: false,
      temperaturaArmazenamento: 'FRIO_2_8',
      validadeMinimaDias: 60,
      stockMinimo: 10,
      stockMaximo: 100,
      pontoEncomenda: 20,
      precoMedioPonderado: 85.00
    }
  ]

  const artigos = {}
  for (const data of artigosData) {
    const artigo = await prisma.artigo.create({ data })
    artigos[artigo.codigo] = artigo
  }
  console.log(`Created ${artigosData.length} artigos`)

  // Create Lotes
  const lotesData = [
    // Amoxicilina - multiple lots
    { numeroLote: 'AMX-2024-001', artigoId: artigos['MED-001'].id, fornecedorId: generis.id, dataFabrico: daysAgo(400), dataValidade: daysFromNow(200), quantidadeInicial: 500, quantidadeActual: 320, estado: 'ACTIVO' },
    { numeroLote: 'AMX-2024-002', artigoId: artigos['MED-001'].id, fornecedorId: generis.id, dataFabrico: daysAgo(200), dataValidade: daysFromNow(400), quantidadeInicial: 600, quantidadeActual: 580, estado: 'ACTIVO' },
    { numeroLote: 'AMX-2023-OLD', artigoId: artigos['MED-001'].id, fornecedorId: generis.id, dataFabrico: daysAgo(600), dataValidade: daysAgo(10), quantidadeInicial: 200, quantidadeActual: 15, estado: 'ACTIVO' }, // Expired!

    // Paracetamol IV
    { numeroLote: 'PAR-2024-001', artigoId: artigos['MED-002'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(100), dataValidade: daysFromNow(120), quantidadeInicial: 200, quantidadeActual: 145, estado: 'ACTIVO' },
    { numeroLote: 'PAR-2024-002', artigoId: artigos['MED-002'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(50), dataValidade: daysFromNow(22), quantidadeInicial: 150, quantidadeActual: 42, estado: 'ACTIVO' }, // Expiring soon!

    // Insulina Glargina - fridge storage
    { numeroLote: 'INS-2024-001', artigoId: artigos['MED-007'].id, fornecedorId: roche.id, dataFabrico: daysAgo(90), dataValidade: daysFromNow(270), quantidadeInicial: 60, quantidadeActual: 38, estado: 'ACTIVO' },
    { numeroLote: 'INS-2024-002', artigoId: artigos['MED-007'].id, fornecedorId: roche.id, dataFabrico: daysAgo(30), dataValidade: daysFromNow(15), quantidadeInicial: 30, quantidadeActual: 8, estado: 'ACTIVO' }, // Expiring soon!

    // Midazolam - psychotropic
    { numeroLote: 'MID-2024-001', artigoId: artigos['MED-008'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(120), dataValidade: daysFromNow(240), quantidadeInicial: 100, quantidadeActual: 72, estado: 'ACTIVO' },
    { numeroLote: 'MID-2023-EXP', artigoId: artigos['MED-008'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(500), dataValidade: daysAgo(5), quantidadeInicial: 50, quantidadeActual: 3, estado: 'ACTIVO' }, // Expired!

    // Propofol
    { numeroLote: 'PRO-2024-001', artigoId: artigos['MED-009'].id, fornecedorId: medinfar.id, dataFabrico: daysAgo(60), dataValidade: daysFromNow(300), quantidadeInicial: 80, quantidadeActual: 55, estado: 'ACTIVO' },
    { numeroLote: 'PRO-2024-002', artigoId: artigos['MED-009'].id, fornecedorId: medinfar.id, dataFabrico: daysAgo(180), dataValidade: daysFromNow(28), quantidadeInicial: 40, quantidadeActual: 12, estado: 'ACTIVO' }, // Expiring soon!

    // Adrenalina
    { numeroLote: 'ADR-2024-001', artigoId: artigos['MED-010'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(150), dataValidade: daysFromNow(180), quantidadeInicial: 200, quantidadeActual: 168, estado: 'ACTIVO' },
    { numeroLote: 'ADR-2024-002', artigoId: artigos['MED-010'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(80), dataValidade: daysFromNow(250), quantidadeInicial: 100, quantidadeActual: 95, estado: 'ACTIVO' },

    // Heparina
    { numeroLote: 'HEP-2024-001', artigoId: artigos['MED-011'].id, fornecedorId: medinfar.id, dataFabrico: daysAgo(100), dataValidade: daysFromNow(200), quantidadeInicial: 300, quantidadeActual: 245, estado: 'ACTIVO' },

    // Morfina - psychotropic
    { numeroLote: 'MOR-2024-001', artigoId: artigos['MED-012'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(90), dataValidade: daysFromNow(360), quantidadeInicial: 80, quantidadeActual: 62, estado: 'ACTIVO' },
    { numeroLote: 'MOR-2024-002', artigoId: artigos['MED-012'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(200), dataValidade: daysAgo(20), quantidadeInicial: 30, quantidadeActual: 2, estado: 'ACTIVO' }, // Expired!

    // Soro Fisiológico
    { numeroLote: 'SFI-2024-001', artigoId: artigos['CON-001'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(60), dataValidade: daysFromNow(365), quantidadeInicial: 500, quantidadeActual: 420, estado: 'ACTIVO' },
    { numeroLote: 'SFI-2024-002', artigoId: artigos['CON-001'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(30), dataValidade: daysFromNow(450), quantidadeInicial: 300, quantidadeActual: 285, estado: 'ACTIVO' },

    // Soro Glicosado
    { numeroLote: 'SGI-2024-001', artigoId: artigos['CON-002'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(45), dataValidade: daysFromNow(400), quantidadeInicial: 250, quantidadeActual: 210, estado: 'ACTIVO' },
    { numeroLote: 'SGI-2024-002', artigoId: artigos['CON-002'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(200), dataValidade: daysFromNow(25), quantidadeInicial: 100, quantidadeActual: 18, estado: 'ACTIVO' }, // Expiring soon!

    // Reagente Glicose
    { numeroLote: 'REA-2024-001', artigoId: artigos['REA-001'].id, fornecedorId: roche.id, dataFabrico: daysAgo(30), dataValidade: daysFromNow(90), quantidadeInicial: 20, quantidadeActual: 14, estado: 'ACTIVO' },
    { numeroLote: 'REA-2024-002', artigoId: artigos['REA-001'].id, fornecedorId: roche.id, dataFabrico: daysAgo(100), dataValidade: daysFromNow(20), quantidadeInicial: 15, quantidadeActual: 4, estado: 'ACTIVO' }, // Expiring soon!

    // Paracetamol lote bloqueado
    { numeroLote: 'PAR-2024-BLQ', artigoId: artigos['MED-002'].id, fornecedorId: labesfal.id, dataFabrico: daysAgo(60), dataValidade: daysFromNow(200), quantidadeInicial: 100, quantidadeActual: 100, estado: 'BLOQUEADO' },

    // Heparina quarentena
    { numeroLote: 'HEP-2024-QUA', artigoId: artigos['MED-011'].id, fornecedorId: medinfar.id, dataFabrico: daysAgo(10), dataValidade: daysFromNow(365), quantidadeInicial: 150, quantidadeActual: 150, estado: 'QUARENTENA' },
  ]

  const lotes = {}
  for (const data of lotesData) {
    const lote = await prisma.lote.create({ data })
    lotes[lote.numeroLote] = lote
  }
  console.log(`Created ${lotesData.length} lotes`)

  // Create StockLocalizacao
  const stockData = [
    // Amoxicilina
    { artigoId: artigos['MED-001'].id, localizacaoId: farCentral.id, quantidade: 650 },
    { artigoId: artigos['MED-001'].id, localizacaoId: armUrg.id, quantidade: 85 }, // Below min (100)
    { artigoId: artigos['MED-001'].id, localizacaoId: armGeral.id, quantidade: 180 },

    // Paracetamol IV
    { artigoId: artigos['MED-002'].id, localizacaoId: farCentral.id, quantidade: 120 },
    { artigoId: artigos['MED-002'].id, localizacaoId: armUrg.id, quantidade: 45 },
    { artigoId: artigos['MED-002'].id, localizacaoId: armBloco.id, quantidade: 22 },

    // Ibuprofeno - critical stock
    { artigoId: artigos['MED-003'].id, localizacaoId: farCentral.id, quantidade: 95 }, // Below min (200)
    { artigoId: artigos['MED-003'].id, localizacaoId: armUrg.id, quantidade: 55 },

    // Omeprazol
    { artigoId: artigos['MED-004'].id, localizacaoId: farCentral.id, quantidade: 420 },
    { artigoId: artigos['MED-004'].id, localizacaoId: armUrg.id, quantidade: 110 },

    // Metformina
    { artigoId: artigos['MED-005'].id, localizacaoId: farCentral.id, quantidade: 380 },

    // Atorvastatina
    { artigoId: artigos['MED-006'].id, localizacaoId: farCentral.id, quantidade: 220 },

    // Insulina Glargina - fridge
    { artigoId: artigos['MED-007'].id, localizacaoId: armFrig.id, quantidade: 46 },
    { artigoId: artigos['MED-007'].id, localizacaoId: farCentral.id, quantidade: 8 }, // Low stock near min

    // Midazolam - psychotropic
    { artigoId: artigos['MED-008'].id, localizacaoId: farCentral.id, quantidade: 55 },
    { artigoId: artigos['MED-008'].id, localizacaoId: armBloco.id, quantidade: 20 },

    // Propofol
    { artigoId: artigos['MED-009'].id, localizacaoId: armBloco.id, quantidade: 48 },
    { artigoId: artigos['MED-009'].id, localizacaoId: farCentral.id, quantidade: 19 },

    // Adrenalina
    { artigoId: artigos['MED-010'].id, localizacaoId: farCentral.id, quantidade: 180 },
    { artigoId: artigos['MED-010'].id, localizacaoId: armUrg.id, quantidade: 55 },
    { artigoId: artigos['MED-010'].id, localizacaoId: armBloco.id, quantidade: 28 },

    // Heparina
    { artigoId: artigos['MED-011'].id, localizacaoId: farCentral.id, quantidade: 245 },
    { artigoId: artigos['MED-011'].id, localizacaoId: armUrg.id, quantidade: 42 }, // Below min (60)

    // Morfina
    { artigoId: artigos['MED-012'].id, localizacaoId: farCentral.id, quantidade: 64 },

    // Seringa 5ml
    { artigoId: artigos['DIS-001'].id, localizacaoId: armGeral.id, quantidade: 2800 },
    { artigoId: artigos['DIS-001'].id, localizacaoId: armUrg.id, quantidade: 650 },
    { artigoId: artigos['DIS-001'].id, localizacaoId: armBloco.id, quantidade: 480 },

    // Agulha 21G
    { artigoId: artigos['DIS-002'].id, localizacaoId: armGeral.id, quantidade: 3200 },
    { artigoId: artigos['DIS-002'].id, localizacaoId: armUrg.id, quantidade: 420 },

    // Cateter IV 18G - critical
    { artigoId: artigos['DIS-003'].id, localizacaoId: armGeral.id, quantidade: 85 }, // Below min (200)
    { artigoId: artigos['DIS-003'].id, localizacaoId: armUrg.id, quantidade: 42 },

    // Compressas 10x10
    { artigoId: artigos['DIS-004'].id, localizacaoId: armGeral.id, quantidade: 850 },
    { artigoId: artigos['DIS-004'].id, localizacaoId: armUrg.id, quantidade: 220 },

    // Penso Rápido
    { artigoId: artigos['DIS-005'].id, localizacaoId: armGeral.id, quantidade: 280 },
    { artigoId: artigos['DIS-005'].id, localizacaoId: armUrg.id, quantidade: 65 },

    // Fio de Sutura
    { artigoId: artigos['DIS-006'].id, localizacaoId: armBloco.id, quantidade: 85 },
    { artigoId: artigos['DIS-006'].id, localizacaoId: farCentral.id, quantidade: 45 },

    // Bisturi n.22
    { artigoId: artigos['DIS-007'].id, localizacaoId: armBloco.id, quantidade: 120 },

    // Dreno Jackson-Pratt
    { artigoId: artigos['DIS-008'].id, localizacaoId: armBloco.id, quantidade: 38 },

    // Luvas Latex M
    { artigoId: artigos['EPI-001'].id, localizacaoId: armGeral.id, quantidade: 4500 },
    { artigoId: artigos['EPI-001'].id, localizacaoId: armUrg.id, quantidade: 1200 },
    { artigoId: artigos['EPI-001'].id, localizacaoId: armBloco.id, quantidade: 800 },

    // Luvas Latex L
    { artigoId: artigos['EPI-002'].id, localizacaoId: armGeral.id, quantidade: 3200 },
    { artigoId: artigos['EPI-002'].id, localizacaoId: armUrg.id, quantidade: 650 },

    // Mascara Cirúrgica
    { artigoId: artigos['EPI-003'].id, localizacaoId: armGeral.id, quantidade: 2800 },
    { artigoId: artigos['EPI-003'].id, localizacaoId: armUrg.id, quantidade: 380 },

    // Mascara FFP2 - low stock
    { artigoId: artigos['EPI-004'].id, localizacaoId: armGeral.id, quantidade: 180 }, // Below min (300)
    { artigoId: artigos['EPI-004'].id, localizacaoId: armUrg.id, quantidade: 45 },

    // Soro Fisiológico
    { artigoId: artigos['CON-001'].id, localizacaoId: farCentral.id, quantidade: 380 },
    { artigoId: artigos['CON-001'].id, localizacaoId: armUrg.id, quantidade: 185 },
    { artigoId: artigos['CON-001'].id, localizacaoId: armBloco.id, quantidade: 140 },

    // Soro Glicosado
    { artigoId: artigos['CON-002'].id, localizacaoId: farCentral.id, quantidade: 168 },
    { artigoId: artigos['CON-002'].id, localizacaoId: armUrg.id, quantidade: 60 },

    // Álcool Etílico
    { artigoId: artigos['CON-003'].id, localizacaoId: armGeral.id, quantidade: 180 },
    { artigoId: artigos['CON-003'].id, localizacaoId: armUrg.id, quantidade: 38 },

    // Gel Desinfectante
    { artigoId: artigos['CON-004'].id, localizacaoId: armGeral.id, quantidade: 420 },
    { artigoId: artigos['CON-004'].id, localizacaoId: armUrg.id, quantidade: 85 },

    // Algodão Hidrófilo - low stock
    { artigoId: artigos['CON-005'].id, localizacaoId: armGeral.id, quantidade: 22 }, // Below min (50)

    // Sabão Antisséptico
    { artigoId: artigos['CON-006'].id, localizacaoId: armGeral.id, quantidade: 220 },
    { artigoId: artigos['CON-006'].id, localizacaoId: armUrg.id, quantidade: 55 },

    // Reagente Glicose
    { artigoId: artigos['REA-001'].id, localizacaoId: armFrig.id, quantidade: 18 },
  ]

  for (const data of stockData) {
    await prisma.stockLocalizacao.create({ data })
  }
  console.log(`Created ${stockData.length} stock locations`)

  // Create Movimentos (last 90 days)
  const utilizadores = ['Dr. Silva', 'Enf. Costa', 'Dr. Ferreira', 'Enf. Santos', 'Dr. Pereira', 'Farm. Oliveira', 'Enf. Rodrigues']

  const movimentosData = []

  // Entradas (stock receptions) over last 90 days
  const entradas = [
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-002'].id, localizacaoId: farCentral.id, quantidade: 600, precoUnitario: 0.15, daysAgoN: 85 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 200, precoUnitario: 2.50, daysAgoN: 82 },
    { artigoId: artigos['MED-007'].id, loteId: lotes['INS-2024-001'].id, localizacaoId: armFrig.id, quantidade: 60, precoUnitario: 45.00, daysAgoN: 88 },
    { artigoId: artigos['MED-008'].id, loteId: lotes['MID-2024-001'].id, localizacaoId: farCentral.id, quantidade: 100, precoUnitario: 3.80, daysAgoN: 80 },
    { artigoId: artigos['MED-009'].id, loteId: lotes['PRO-2024-001'].id, localizacaoId: armBloco.id, quantidade: 80, precoUnitario: 8.50, daysAgoN: 78 },
    { artigoId: artigos['MED-010'].id, loteId: lotes['ADR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 200, precoUnitario: 1.20, daysAgoN: 75 },
    { artigoId: artigos['MED-011'].id, loteId: lotes['HEP-2024-001'].id, localizacaoId: farCentral.id, quantidade: 300, precoUnitario: 2.10, daysAgoN: 72 },
    { artigoId: artigos['MED-012'].id, loteId: lotes['MOR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 80, precoUnitario: 4.50, daysAgoN: 70 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-001'].id, localizacaoId: farCentral.id, quantidade: 500, precoUnitario: 1.50, daysAgoN: 68 },
    { artigoId: artigos['CON-002'].id, loteId: lotes['SGI-2024-001'].id, localizacaoId: farCentral.id, quantidade: 250, precoUnitario: 1.80, daysAgoN: 65 },
    { artigoId: artigos['REA-001'].id, loteId: lotes['REA-2024-001'].id, localizacaoId: armFrig.id, quantidade: 20, precoUnitario: 85.00, daysAgoN: 62 },
    { artigoId: artigos['DIS-001'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 2000, precoUnitario: 0.08, daysAgoN: 60 },
    { artigoId: artigos['DIS-002'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 2000, precoUnitario: 0.05, daysAgoN: 58 },
    { artigoId: artigos['EPI-001'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 3000, precoUnitario: 0.12, daysAgoN: 55 },
    { artigoId: artigos['EPI-002'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 2500, precoUnitario: 0.12, daysAgoN: 52 },
    { artigoId: artigos['EPI-003'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 2000, precoUnitario: 0.15, daysAgoN: 50 },
    { artigoId: artigos['MED-003'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 500, precoUnitario: 0.08, daysAgoN: 48 },
    { artigoId: artigos['MED-004'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 800, precoUnitario: 0.12, daysAgoN: 45 },
    { artigoId: artigos['MED-005'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 600, precoUnitario: 0.10, daysAgoN: 42 },
    { artigoId: artigos['MED-006'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 400, precoUnitario: 0.25, daysAgoN: 40 },
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: farCentral.id, quantidade: 500, precoUnitario: 0.15, daysAgoN: 38 },
    { artigoId: artigos['CON-003'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 200, precoUnitario: 2.20, daysAgoN: 35 },
    { artigoId: artigos['CON-004'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 500, precoUnitario: 3.50, daysAgoN: 32 },
    { artigoId: artigos['DIS-004'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 800, precoUnitario: 1.20, daysAgoN: 30 },
    { artigoId: artigos['DIS-006'].id, loteId: null, localizacaoId: armBloco.id, quantidade: 100, precoUnitario: 18.00, daysAgoN: 28 },
    { artigoId: artigos['DIS-007'].id, loteId: null, localizacaoId: armBloco.id, quantidade: 200, precoUnitario: 0.95, daysAgoN: 25 },
    { artigoId: artigos['CON-006'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 300, precoUnitario: 4.20, daysAgoN: 22 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-002'].id, localizacaoId: farCentral.id, quantidade: 300, precoUnitario: 1.50, daysAgoN: 20 },
    { artigoId: artigos['ADR-2024-002'] ? artigos['MED-010'].id : artigos['MED-010'].id, loteId: lotes['ADR-2024-002'].id, localizacaoId: farCentral.id, quantidade: 100, precoUnitario: 1.20, daysAgoN: 18 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-002'].id, localizacaoId: farCentral.id, quantidade: 150, precoUnitario: 2.50, daysAgoN: 15 },
  ]

  for (const e of entradas) {
    movimentosData.push({
      tipo: 'ENTRADA',
      artigoId: e.artigoId,
      loteId: e.loteId,
      localizacaoId: e.localizacaoId,
      quantidade: e.quantidade,
      precoUnitario: e.precoUnitario,
      valorTotal: e.quantidade * e.precoUnitario,
      referencia: `GR-2024-${String(movimentosData.length + 1).padStart(4, '0')}`,
      utilizador: utilizadores[movimentosData.length % utilizadores.length],
      createdAt: daysAgo(e.daysAgoN)
    })
  }

  // Saídas (dispensing)
  const saidas = [
    // Daily dispensing of common items
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: farCentral.id, quantidade: 30, precoUnitario: 0.15, daysAgoN: 2 },
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: farCentral.id, quantidade: 25, precoUnitario: 0.15, daysAgoN: 3 },
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: farCentral.id, quantidade: 40, precoUnitario: 0.15, daysAgoN: 5 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 15, precoUnitario: 2.50, daysAgoN: 1 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 20, precoUnitario: 2.50, daysAgoN: 4 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 18, precoUnitario: 2.50, daysAgoN: 7 },
    { artigoId: artigos['MED-003'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 50, precoUnitario: 0.08, daysAgoN: 2 },
    { artigoId: artigos['MED-003'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 45, precoUnitario: 0.08, daysAgoN: 6 },
    { artigoId: artigos['MED-003'].id, loteId: null, localizacaoId: armUrg.id, quantidade: 35, precoUnitario: 0.08, daysAgoN: 8 },
    { artigoId: artigos['MED-004'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 60, precoUnitario: 0.12, daysAgoN: 3 },
    { artigoId: artigos['MED-004'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 55, precoUnitario: 0.12, daysAgoN: 10 },
    { artigoId: artigos['MED-007'].id, loteId: lotes['INS-2024-001'].id, localizacaoId: armFrig.id, quantidade: 5, precoUnitario: 45.00, daysAgoN: 2 },
    { artigoId: artigos['MED-007'].id, loteId: lotes['INS-2024-001'].id, localizacaoId: armFrig.id, quantidade: 4, precoUnitario: 45.00, daysAgoN: 5 },
    { artigoId: artigos['MED-008'].id, loteId: lotes['MID-2024-001'].id, localizacaoId: farCentral.id, quantidade: 8, precoUnitario: 3.80, daysAgoN: 1 },
    { artigoId: artigos['MED-008'].id, loteId: lotes['MID-2024-001'].id, localizacaoId: farCentral.id, quantidade: 5, precoUnitario: 3.80, daysAgoN: 4 },
    { artigoId: artigos['MED-009'].id, loteId: lotes['PRO-2024-001'].id, localizacaoId: armBloco.id, quantidade: 6, precoUnitario: 8.50, daysAgoN: 2 },
    { artigoId: artigos['MED-010'].id, loteId: lotes['ADR-2024-001'].id, localizacaoId: armUrg.id, quantidade: 5, precoUnitario: 1.20, daysAgoN: 1 },
    { artigoId: artigos['MED-010'].id, loteId: lotes['ADR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 8, precoUnitario: 1.20, daysAgoN: 3 },
    { artigoId: artigos['MED-011'].id, loteId: lotes['HEP-2024-001'].id, localizacaoId: farCentral.id, quantidade: 15, precoUnitario: 2.10, daysAgoN: 2 },
    { artigoId: artigos['MED-012'].id, loteId: lotes['MOR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 4, precoUnitario: 4.50, daysAgoN: 1 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-001'].id, localizacaoId: farCentral.id, quantidade: 30, precoUnitario: 1.50, daysAgoN: 1 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-001'].id, localizacaoId: armUrg.id, quantidade: 25, precoUnitario: 1.50, daysAgoN: 2 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-001'].id, localizacaoId: armBloco.id, quantidade: 20, precoUnitario: 1.50, daysAgoN: 3 },
    { artigoId: artigos['DIS-001'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 150, precoUnitario: 0.08, daysAgoN: 1 },
    { artigoId: artigos['DIS-001'].id, loteId: null, localizacaoId: armUrg.id, quantidade: 100, precoUnitario: 0.08, daysAgoN: 2 },
    { artigoId: artigos['DIS-002'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 200, precoUnitario: 0.05, daysAgoN: 1 },
    { artigoId: artigos['EPI-001'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 200, precoUnitario: 0.12, daysAgoN: 1 },
    { artigoId: artigos['EPI-001'].id, loteId: null, localizacaoId: armUrg.id, quantidade: 150, precoUnitario: 0.12, daysAgoN: 2 },
    { artigoId: artigos['EPI-003'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 100, precoUnitario: 0.15, daysAgoN: 1 },

    // Historical saidas (older months for chart)
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: farCentral.id, quantidade: 180, precoUnitario: 0.15, daysAgoN: 35 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-001'].id, localizacaoId: farCentral.id, quantidade: 120, precoUnitario: 2.50, daysAgoN: 40 },
    { artigoId: artigos['MED-003'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 250, precoUnitario: 0.08, daysAgoN: 45 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-001'].id, localizacaoId: farCentral.id, quantidade: 200, precoUnitario: 1.50, daysAgoN: 50 },
    { artigoId: artigos['EPI-001'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 800, precoUnitario: 0.12, daysAgoN: 55 },
    { artigoId: artigos['MED-004'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 320, precoUnitario: 0.12, daysAgoN: 60 },
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: farCentral.id, quantidade: 160, precoUnitario: 0.15, daysAgoN: 65 },
    { artigoId: artigos['MED-007'].id, loteId: lotes['INS-2024-001'].id, localizacaoId: armFrig.id, quantidade: 18, precoUnitario: 45.00, daysAgoN: 70 },
    { artigoId: artigos['DIS-001'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 1200, precoUnitario: 0.08, daysAgoN: 75 },
    { artigoId: artigos['MED-003'].id, loteId: null, localizacaoId: farCentral.id, quantidade: 300, precoUnitario: 0.08, daysAgoN: 80 },
    { artigoId: artigos['CON-004'].id, loteId: null, localizacaoId: armGeral.id, quantidade: 180, precoUnitario: 3.50, daysAgoN: 85 },
    { artigoId: artigos['MED-011'].id, loteId: lotes['HEP-2024-001'].id, localizacaoId: farCentral.id, quantidade: 55, precoUnitario: 2.10, daysAgoN: 88 },
  ]

  for (const s of saidas) {
    movimentosData.push({
      tipo: 'SAIDA',
      artigoId: s.artigoId,
      loteId: s.loteId,
      localizacaoId: s.localizacaoId,
      quantidade: s.quantidade,
      precoUnitario: s.precoUnitario,
      valorTotal: s.quantidade * s.precoUnitario,
      referencia: `SD-2024-${String(movimentosData.length + 1).padStart(4, '0')}`,
      utilizador: utilizadores[movimentosData.length % utilizadores.length],
      createdAt: daysAgo(s.daysAgoN)
    })
  }

  // Transferências
  const transferencias = [
    { artigoId: artigos['MED-001'].id, loteId: lotes['AMX-2024-001'].id, localizacaoId: armUrg.id, quantidade: 100, precoUnitario: 0.15, daysAgoN: 20 },
    { artigoId: artigos['MED-002'].id, loteId: lotes['PAR-2024-001'].id, localizacaoId: armUrg.id, quantidade: 30, precoUnitario: 2.50, daysAgoN: 18 },
    { artigoId: artigos['CON-001'].id, loteId: lotes['SFI-2024-001'].id, localizacaoId: armUrg.id, quantidade: 50, precoUnitario: 1.50, daysAgoN: 15 },
    { artigoId: artigos['EPI-001'].id, loteId: null, localizacaoId: armUrg.id, quantidade: 300, precoUnitario: 0.12, daysAgoN: 12 },
    { artigoId: artigos['MED-008'].id, loteId: lotes['MID-2024-001'].id, localizacaoId: armBloco.id, quantidade: 20, precoUnitario: 3.80, daysAgoN: 10 },
    { artigoId: artigos['DIS-006'].id, loteId: null, localizacaoId: armBloco.id, quantidade: 30, precoUnitario: 18.00, daysAgoN: 8 },
  ]

  for (const t of transferencias) {
    movimentosData.push({
      tipo: 'TRANSFERENCIA',
      artigoId: t.artigoId,
      loteId: t.loteId,
      localizacaoId: t.localizacaoId,
      quantidade: t.quantidade,
      precoUnitario: t.precoUnitario,
      valorTotal: t.quantidade * t.precoUnitario,
      referencia: `TR-2024-${String(movimentosData.length + 1).padStart(4, '0')}`,
      motivo: 'Reposição de stock avançado',
      utilizador: utilizadores[movimentosData.length % utilizadores.length],
      createdAt: daysAgo(t.daysAgoN)
    })
  }

  // Create all movements
  for (const mov of movimentosData) {
    await prisma.movimento.create({ data: mov })
  }
  console.log(`Created ${movimentosData.length} movimentos`)

  // Create Encomendas
  const enc1 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-001',
      fornecedorId: generis.id,
      estado: 'COMPLETA',
      dataEncomenda: daysAgo(45),
      dataEntregaPrevista: daysAgo(38),
      dataEntregaReal: daysAgo(36),
      observacoes: 'Entrega normal'
    }
  })

  const enc2 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-002',
      fornecedorId: labesfal.id,
      estado: 'COMPLETA',
      dataEncomenda: daysAgo(40),
      dataEntregaPrevista: daysAgo(33),
      dataEntregaReal: daysAgo(32),
      observacoes: 'Urgente - reposição stock crítico'
    }
  })

  const enc3 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-003',
      fornecedorId: roche.id,
      estado: 'PENDENTE',
      dataEncomenda: daysAgo(10),
      dataEntregaPrevista: daysFromNow(5),
      observacoes: 'Aguardar entrega reagentes'
    }
  })

  const enc4 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-004',
      fornecedorId: medinfar.id,
      estado: 'PENDENTE',
      dataEncomenda: daysAgo(15),
      dataEntregaPrevista: daysAgo(5), // Overdue!
      observacoes: 'Atraso previsto fornecedor'
    }
  })

  const enc5 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-005',
      fornecedorId: ocp.id,
      estado: 'PARCIAL',
      dataEncomenda: daysAgo(20),
      dataEntregaPrevista: daysAgo(8), // Partially overdue
      observacoes: 'Entrega parcial recebida'
    }
  })

  const enc6 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-006',
      fornecedorId: labesfal.id,
      estado: 'PENDENTE',
      dataEncomenda: daysAgo(5),
      dataEntregaPrevista: daysFromNow(10),
    }
  })

  const enc7 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-007',
      fornecedorId: generis.id,
      estado: 'CANCELADA',
      dataEncomenda: daysAgo(30),
      dataEntregaPrevista: daysAgo(20),
      observacoes: 'Cancelada por descontinuação do produto'
    }
  })

  const enc8 = await prisma.encomenda.create({
    data: {
      numero: 'ENC-2024-008',
      fornecedorId: roche.id,
      estado: 'PARCIAL',
      dataEncomenda: daysAgo(25),
      dataEntregaPrevista: daysAgo(12),
      observacoes: 'Entrega parcial - restante aguarda fabrico'
    }
  })

  // Create Linhas Encomenda
  await prisma.linhaEncomenda.createMany({
    data: [
      { encomendaId: enc1.id, artigoId: artigos['MED-001'].id, quantidadeEncomendada: 600, quantidadeRecebida: 600, precoUnitario: 0.15 },
      { encomendaId: enc1.id, artigoId: artigos['MED-003'].id, quantidadeEncomendada: 1000, quantidadeRecebida: 1000, precoUnitario: 0.08 },
      { encomendaId: enc2.id, artigoId: artigos['MED-002'].id, quantidadeEncomendada: 200, quantidadeRecebida: 200, precoUnitario: 2.50 },
      { encomendaId: enc2.id, artigoId: artigos['MED-011'].id, quantidadeEncomendada: 300, quantidadeRecebida: 300, precoUnitario: 2.10 },
      { encomendaId: enc3.id, artigoId: artigos['REA-001'].id, quantidadeEncomendada: 30, quantidadeRecebida: 0, precoUnitario: 85.00 },
      { encomendaId: enc3.id, artigoId: artigos['MED-007'].id, quantidadeEncomendada: 50, quantidadeRecebida: 0, precoUnitario: 45.00 },
      { encomendaId: enc4.id, artigoId: artigos['MED-009'].id, quantidadeEncomendada: 100, quantidadeRecebida: 0, precoUnitario: 8.50 },
      { encomendaId: enc4.id, artigoId: artigos['MED-008'].id, quantidadeEncomendada: 80, quantidadeRecebida: 0, precoUnitario: 3.80 },
      { encomendaId: enc5.id, artigoId: artigos['DIS-001'].id, quantidadeEncomendada: 5000, quantidadeRecebida: 2000, precoUnitario: 0.08 },
      { encomendaId: enc5.id, artigoId: artigos['DIS-002'].id, quantidadeEncomendada: 5000, quantidadeRecebida: 2000, precoUnitario: 0.05 },
      { encomendaId: enc6.id, artigoId: artigos['MED-004'].id, quantidadeEncomendada: 1000, quantidadeRecebida: 0, precoUnitario: 0.12 },
      { encomendaId: enc6.id, artigoId: artigos['MED-005'].id, quantidadeEncomendada: 800, quantidadeRecebida: 0, precoUnitario: 0.10 },
      { encomendaId: enc6.id, artigoId: artigos['MED-006'].id, quantidadeEncomendada: 500, quantidadeRecebida: 0, precoUnitario: 0.25 },
      { encomendaId: enc7.id, artigoId: artigos['MED-003'].id, quantidadeEncomendada: 2000, quantidadeRecebida: 0, precoUnitario: 0.08 },
      { encomendaId: enc8.id, artigoId: artigos['EPI-004'].id, quantidadeEncomendada: 2000, quantidadeRecebida: 500, precoUnitario: 0.95 },
      { encomendaId: enc8.id, artigoId: artigos['EPI-003'].id, quantidadeEncomendada: 3000, quantidadeRecebida: 1500, precoUnitario: 0.15 },
    ]
  })

  console.log('Created 8 encomendas with lines')
  console.log('Seed completed successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
