'use client';

export function MapSection() {
    return (
        <section className="h-[400px] w-full bg-gray-200 relative">
            <iframe
                src="https://maps.google.com/maps?q=14.8436836,120.8133586&hl=en&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>

            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 bg-white p-6 rounded-xl shadow-lg max-w-sm hidden md:block">
                <h3 className="font-bold text-lg text-salon-dark mb-2">Tres Marias Salon Main</h3>
                <p className="text-gray-600 text-sm mb-4">
                    Visit us at our main branch.<br />
                    Open Google Maps for directions.
                </p>
                <a
                    href="https://www.google.com/maps/place/Tres+Marias+Salon+Main/@14.8436888,120.8107837,17z/data=!3m1!4b1!4m6!3m5!1s0x339653d2c4a08437:0x320cba2b8b2a5c45!8m2!3d14.8436836!4d120.8133586"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-salon-primary font-bold text-sm hover:underline"
                >
                    Get Directions
                </a>
            </div>
        </section>
    );
}
