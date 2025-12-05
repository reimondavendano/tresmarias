
// import React from 'react';
// import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { Provider } from 'react-redux';
// import configureStore from 'redux-mock-store';
// import { thunk } from 'redux-thunk';
// import ServiceManagement from './ServiceManagement';
// import * as servicesSlice from '@/store/slices/servicesSlice';
// import { useAppSelector, useAppDispatch } from '@/store/hooks';
// import { Service } from '@/types';

// // Mock the hooks from '@/store/hooks'
// jest.mock('@/store/hooks', () => ({
//   useAppDispatch: jest.fn(),
//   useAppSelector: jest.fn(),
// }));

// // Mock the slice actions. We only need to know that they are functions.
// jest.mock('@/store/slices/servicesSlice');

// const middlewares = [thunk];
// const mockStore = configureStore(middlewares);

// // Typecast the mocked hooks
// const mockedUseAppDispatch = useAppDispatch as jest.Mock;
// const mockedUseAppSelector = useAppSelector as jest.Mock;

// const mockService: Service = {
//   id: '1',
//   name: 'Test Service',
//   description: 'A service for testing',
//   price: 100,
//   duration: 60,
//   category: 'hair',
//   image: 'test.jpg',
//   is_active: true,
//   discount: 10,
//   created_at: new Date().toISOString(),
//   updated_at: new Date().toISOString(),
//   total_price: 90,
// };

// describe('ServiceManagement', () => {
//   let store;
//   // This will be the mock dispatch function returned by the useAppDispatch hook
//   const mockDispatch = jest.fn();

//   beforeEach(() => {
//     // Reset mocks before each test
//     jest.clearAllMocks();

//     // Mock the dispatch function to return a resolved promise 
//     // with the `unwrap` function, simulating a successful async thunk.
//     mockDispatch.mockReturnValue(Promise.resolve({ unwrap: () => Promise.resolve() }));
//     mockedUseAppDispatch.mockReturnValue(mockDispatch);
//   });

//   const renderComponent = (state) => {
//     store = mockStore({ services: state });
//     mockedUseAppSelector.mockImplementation(callback => callback(store.getState()));
    
//     render(
//       <Provider store={store}>
//         <ServiceManagement />
//       </Provider>
//     );
//   };

//   it('renders loading state correctly', () => {
//     renderComponent({
//       services: [],
//       isLoadingServices: true,
//       errorServices: null,
//     });
//     expect(screen.getByText('Loading services...')).toBeInTheDocument();
//   });

//   it('renders error state correctly', () => {
//     renderComponent({
//       services: [],
//       isLoadingServices: false,
//       errorServices: 'Failed to fetch',
//     });
//     expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
//   });

//   it('renders with a list of services', () => {
//     renderComponent({
//       services: [mockService],
//       isLoadingServices: false,
//       errorServices: null,
//     });
//     expect(screen.getByText('Test Service')).toBeInTheDocument();
//     expect(screen.getByText('A service for testing')).toBeInTheDocument();
//   });

//   it('opens the add service dialog and dispatches the add service action', async () => {
//     renderComponent({
//       services: [],
//       isLoadingServices: false,
//       errorServices: null,
//       isAddingService: false,
//       addServiceError: null,
//     });

//     fireEvent.click(screen.getByRole('button', { name: /add new service/i }));
    
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: 'New Service' } });
//     fireEvent.click(within(dialog).getByRole('button', { name: 'Add Service' }));

//     await waitFor(() => {
//       // Check that dispatch was called with the action from the slice
//       expect(mockDispatch).toHaveBeenCalledWith(servicesSlice.addService(expect.any(Object)));
//     });
//   });

//   it('opens the edit service dialog and dispatches the update service action', async () => {
//     renderComponent({
//       services: [mockService],
//       isLoadingServices: false,
//       errorServices: null,
//     });

//     fireEvent.click(screen.getAllByText('Edit')[0]);
//     const dialog = screen.getByRole('dialog');
//     fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: 'Updated Service' } });
//     fireEvent.click(within(dialog).getByRole('button', { name: /save changes/i }));

//     await waitFor(() => {
//       expect(mockDispatch).toHaveBeenCalledWith(servicesSlice.updateService(expect.any(Object)));
//     });
//   });

//   it('opens the delete confirmation dialog and dispatches the delete service action', async () => {
//     renderComponent({
//       services: [mockService],
//       isLoadingServices: false,
//       errorServices: null,
//       isDeletingService: false,
//       deleteServiceError: null,
//     });

//     fireEvent.click(screen.getAllByText('Delete')[0]);
    
//     const dialog = screen.getByRole('dialog');
//     fireEvent.click(within(dialog).getByRole('button', { name: /delete/i }));

//     await waitFor(() => {
//       expect(mockDispatch).toHaveBeenCalledWith(servicesSlice.deleteService('1'));
//     });
//   });
// });
