import { prisma } from './src/lib/db'

async function run() {
  const account = await prisma.account.findFirst({ where: { providerId: 'credential' } })
  console.log('Hash format:', account?.password?.substring(0, 30))
}
run()
