import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const armGeral = await prisma.localizacao.findUnique({ where: { codigo: 'ARM-GERAL' } })
  const armUrg   = await prisma.localizacao.findUnique({ where: { codigo: 'ARM-URG' } })
  const seringa  = await prisma.artigo.findUnique({ where: { codigo: 'DIS-001' } }) // Seringa 5ml

  if (!armGeral || !armUrg || !seringa) {
    console.error('Localizações ou artigo não encontrados. Verifique se o seed foi executado.')
    process.exit(1)
  }

  await prisma.movimento.create({
    data: {
      tipo:                 'TRANSFERENCIA',
      artigoId:             seringa.id,
      localizacaoId:        armGeral.id,
      localizacaoDestinoId: armUrg.id,
      quantidade:           200,
      precoUnitario:        seringa.precoMedioPonderado,
      valorTotal:           200 * seringa.precoMedioPonderado,
      referencia:           'TR-2026-001',
      motivo:               'Reposição de urgência',
      utilizador:           'Enf. Maria Costa',
      observacoes:          'Transferência de reposição para o armazém de urgência'
    }
  })

  console.log('Transferência criada: ARM-GERAL → ARM-URG (Seringa 5ml, 200 un.)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
