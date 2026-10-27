const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('BD Education Board Result API is Running!');
});

app.post('/api/get-result', async (req, res) => {
    const { exam, year, board, roll, reg } = req.body;

    try {
        const response = await axios.post('http://www.educationboardresults.gov.bd/result.php', new URLSearchParams({
            sr: '3',
            et: '2',
            exam: exam,
            year: year,
            board: board,
            roll: roll,
            reg: reg
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const studentInfo = {};

        $('table.black12 tr').each((index, element) => {
            const tds = $(element).find('td');
            if (tds.length === 4) {
                const key1 = $(tds[0]).text().trim();
                const val1 = $(tds[1]).text().trim();
                const key2 = $(tds[2]).text().trim();
                const val2 = $(tds[3]).text().trim();
                
                if (key1) studentInfo[key1] = val1;
                if (key2) studentInfo[key2] = val2;
            }
        });

        if (Object.keys(studentInfo).length > 0) {
            return res.json({ success: true, data: studentInfo });
        } else {
            return res.status(404).json({ success: false, message: "Result not found or Invalid Roll/Reg" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Connection Error", error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
