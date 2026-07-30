import { auth } from './src/server/auth'
import { prisma } from './src/lib/db'

async function test() {
  try {
    // Delete if exists
    await prisma.user.deleteMany({ where: { email: 'test@clinic.com' } })

    console.log('Registering user via auth API...')
    const res = await auth.api.signUpEmail({
      body: {
        email: 'test@clinic.com',
        password: 'password123',
        name: 'Test User',
      },
      headers: new Headers(),
    })

    console.log('Sign up result:', !!res)

    const user = await prisma.user.findUnique({ where: { email: 'test@clinic.com' } })
    console.log('User password field:', user?.password ? 'exists' : 'null')

    const accounts = await prisma.account.findMany({ where: { userId: user?.id } })
    console.log(
      'Accounts:',
      accounts.map((a) => ({ provider: a.providerId, hasPassword: !!a.password })),
    )
  } catch (err) {
    console.error(err)
  }
}
test()
