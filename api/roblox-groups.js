export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Sadece GET destekleniyor." });
        return;
    }

    const { username } = req.query;
    if (!username) {
        res.status(400).json({ error: "Lütfen ?username=kullaniciadi şeklinde sorgula." });
        return;
    }

    // 1. Kullanıcı adından ID ve banlılık durumu al
    let userId = null;
    let isBanned = null;
    try {
        const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
        });
        const userData = await userRes.json();
        if (userData?.data && userData.data.length > 0) {
            userId = userData.data[0].id;
            isBanned = userData.data[0].isBanned; // true/false
        }
    } catch (e) {
        res.status(500).json({ error: "Kullanıcı ID alınamadı." });
        return;
    }

    if (!userId) {
        res.status(404).json({ error: "Kullanıcı bulunamadı." });
        return;
    }

    // 2. Grup bilgilerini al
    let groupData = null;
    try {
        const groupRes = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept-Encoding": "gzip, deflate"
            }
        });
        groupData = await groupRes.json();
    } catch (e) {
        res.status(500).json({ error: "Grup verisi alınamadı." });
        return;
    }

    if (!groupData || !groupData.data) {
        res.status(404).json({ error: "Grup verisi bulunamadı." });
        return;
    }

    // 3. Sonuçları hazırla
    const groupsList = groupData.data.map(item",
        role_name: item.role?.name || "Bilinmiyor"
    }));

    res.status(200).json({
        user_id: userId,
        username,
        profile_link: `https://www.roblox.com/users/${userId}/profile`,
        group_count: groupsList.length,
        is_banned: isBanned, // roblox hesabı banlı mı
        groups: groupsList
    });
}
