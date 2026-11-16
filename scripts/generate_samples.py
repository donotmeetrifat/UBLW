import asyncio
import edge_tts
import os

samples = [
    {
        'file': 'public/voice-samples/emma-uk-sonia-greeting.mp3',
        'voice': 'en-GB-SoniaNeural',
        'text': 'Hello darling, welcome to UK Brand Lover! I am Emma, your personal beauty advisor. How may I assist you with your authentic British skincare or haircare routine today?'
    },
    {
        'file': 'public/voice-samples/emma-uk-sonia-advice.mp3',
        'voice': 'en-GB-SoniaNeural',
        'text': 'For acne and blemish-prone skin, I highly recommend our CeraVe Blemish Control Cleanser. It is imported directly from London with original batch code proof, and it is currently in stock for 2,150 Taka. Shall I add it to your bag?'
    },
    {
        'file': 'public/voice-samples/emma-uk-libby-greeting.mp3',
        'voice': 'en-GB-LibbyNeural',
        'text': 'Hi there! Welcome to UK Brand Lover. Every single product here is 100% authentic and sourced directly from the United Kingdom. Tell me about your skin type, and let us find your perfect match!'
    },
    {
        'file': 'public/voice-samples/emma-bn-nabanita-greeting.mp3',
        'voice': 'bn-BD-NabanitaNeural',
        'text': 'আসসালামু আলাইকুম! ইউকে ব্র্যান্ড লাভারে আপনাকে স্বাগতম। আমি এমা, আপনার পার্সোনাল বিউটি অ্যাডভাইজর। আপনার ত্বকের যত্ন বা পছন্দের পণ্য খুঁজে পেতে আমি কীভাবে সাহায্য করতে পারি?'
    },
    {
        'file': 'public/voice-samples/emma-bn-nabanita-advice.mp3',
        'voice': 'bn-BD-NabanitaNeural',
        'text': 'আপনার ত্বকের ব্রাইটনিং এবং দাগ দূর করার জন্য গার্নিয়ার ভিটামিন সি সিরাম অত্যন্ত কার্যকরী। এটি শতভাগ অরিজিনাল এবং সরাসরি ইউকে থেকে আমদানিকৃত। আপনি কি এটি সম্পর্কে আরও জানতে চান?'
    }
]

os.makedirs('public/voice-samples', exist_ok=True)

async def main():
    for s in samples:
        filename = s['file']
        print(f"Generating {filename} with voice {s['voice']}...")
        comm = edge_tts.Communicate(s['text'], s['voice'])
        await comm.save(filename)
    print("All samples generated successfully!")

if __name__ == '__main__':
    asyncio.run(main())
