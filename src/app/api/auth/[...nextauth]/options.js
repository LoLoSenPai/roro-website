import TwitterProvider from 'next-auth/providers/twitter';

export const options = {
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            version: "1.1", // Utilisation de l'API v1.1
            scope: 'tweet.read users.read',
            profile(profile) {
                return {
                    id: profile.id_str,
                    name: profile.name,
                    screen_name: profile.screen_name,
                    image: profile.profile_image_url_https,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account?.provider === 'twitter') {
                token.screen_name = profile?.screen_name || null;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.handle = token.screen_name ? `@${token.screen_name}` : session.user.name;
            console.log("Session handle:", session.user.handle);
            return session;
        },
    },
};

export const authOptions = options;
