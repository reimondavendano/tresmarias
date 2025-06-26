'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from '@/public/assets/img/1.jpg' // ✅ adjust path as needed
// e.g. in index.d.ts or a fonts.ts file
import { Molle } from 'next/font/google'
export const molle = Molle({ subsets: ['latin'], weight: '400' })

const navigation = [
	{ name: 'Home', href: '#home' },
	{ name: 'Services', href: '#services' },
	{ name: 'Our Team', href: '#team' },
	{ name: 'Gallery', href: '#gallery' },
	{ name: 'About', href: '#about' },
	{ name: 'Contact', href: '#contact' },
];

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleNavClick = (href: string) => {
		if (href.startsWith('#')) {
			const element = document.querySelector(href);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
		setIsMobileMenuOpen(false);
	};

	return (
		<nav
			className={cn(
				'fixed top-0 w-full z-50 transition-all duration-300',
				isScrolled
					? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-salon-primary/10'
					: 'bg-transparent'
			)}
		>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* Logo */}
					<Link href='/' className='flex items-center space-x-2'>
						<Image
							src={logo}
							alt='Tres Marias Logo'
							width={40}
							height={40}
							className='object-contain'
							priority
						/>
						 <span
              style={{
                WebkitTextStroke: '1px black',
                color: '#fff',
              }}
              className={`${molle.className} text-2xl font-bold`}
            >
              Tres Marias Salon
            </span>
					</Link>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center space-x-8'>
						{navigation.map((item) => (
							<button
								key={item.name}
								onClick={() => handleNavClick(item.href)}
								className={cn(
									'text-sm font-medium transition-colors hover:text-salon-primary',
									isScrolled ? 'text-gray-700' : 'text-white'
								)}
							>
								{item.name}
							</button>
						))}
					</div>

					{/* Book Appointment Button */}
					<div className='hidden md:flex items-center space-x-4'>
						<Link href='/booking'>
							<Button className='bg-salon-primary hover:bg-salon-primary/90 text-white'>
								<Calendar className='h-4 w-4 mr-2' />
								Book Now
							</Button>
						</Link>
						<Link href='/admin/login'>
							<Button variant='outline' size='sm'>
								Admin
							</Button>
						</Link>
					</div>

					{/* Mobile menu button */}
					<div className='md:hidden'>
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className={cn(
								'p-2 rounded-md',
								isScrolled ? 'text-gray-700' : 'text-white'
							)}
						>
							{isMobileMenuOpen ? (
								<X className='h-6 w-6' />
							) : (
								<Menu className='h-6 w-6' />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMobileMenuOpen && (
					<div className='md:hidden'>
						<div className='px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200'>
							{navigation.map((item) => (
								<button
									key={item.name}
									onClick={() => handleNavClick(item.href)}
									className='block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-salon-primary hover:bg-gray-50 rounded-md'
								>
									{item.name}
								</button>
							))}
							<div className='pt-2 border-t border-gray-200'>
								<Link href='/booking' className='block w-full'>
									<Button className='w-full bg-salon-primary hover:bg-salon-primary/90 text-white mb-2'>
										<Calendar className='h-4 w-4 mr-2' />
										Book Now
									</Button>
								</Link>
								<Link href='/admin/login' className='block w-full'>
									<Button variant='outline' className='w-full'>
										Admin Login
									</Button>
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}